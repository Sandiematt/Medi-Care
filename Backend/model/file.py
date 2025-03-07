import os
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
from torchvision.models import resnet50, ResNet50_Weights
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from PIL import Image
import argparse

# Set random seed for reproducibility
torch.manual_seed(42)
np.random.seed(42)

# 1. Data Preparation - Using folder structure for labels
class DrugPackageDataset(Dataset):
    def __init__(self, data_dir, transform=None):
        """
        Args:
            data_dir (string): Directory containing class subfolders with images
            transform (callable, optional): Optional transform to be applied on a sample
        """
        self.data_dir = data_dir
        self.transform = transform
        self.image_paths = []
        self.labels = []
        self.class_names = []
        
        # Get class folders (authentic and counterfeit)
        class_dirs = [d for d in os.listdir(data_dir) 
                     if os.path.isdir(os.path.join(data_dir, d))]
        
        # If no subfolders, assume all images are in data_dir and need manual labeling
        if not class_dirs:
            print(f"No class subfolders found in {data_dir}. Please organize images into 'authentic' and 'counterfeit' subfolders.")
            return
        
        # Map folder names to class indices
        self.class_names = sorted(class_dirs)  # Sort to ensure consistent ordering
        class_to_idx = {cls_name: i for i, cls_name in enumerate(self.class_names)}
        
        # Collect all image paths and their labels
        for class_name in class_dirs:
            class_idx = class_to_idx[class_name]
            class_dir = os.path.join(data_dir, class_name)
            
            # Get all valid image files in this class folder
            valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff')
            for filename in os.listdir(class_dir):
                if filename.lower().endswith(valid_extensions):
                    self.image_paths.append(os.path.join(class_dir, filename))
                    self.labels.append(class_idx)
        
        print(f"Found {len(self.image_paths)} images across {len(class_dirs)} classes.")
        print(f"Class distribution: {[self.labels.count(i) for i in range(len(self.class_names))]}")
        print(f"Class names: {self.class_names}")
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()
        
        try:
            img_path = self.image_paths[idx]
            label = self.labels[idx]
            
            # Load image
            image = Image.open(img_path).convert('RGB')
            
            if self.transform:
                image = self.transform(image)
            
            return image, label
            
        except Exception as e:
            print(f"Error loading image at {img_path}: {e}")
            # Provide a fallback in case of error
            dummy_image = torch.zeros((3, 224, 224))
            return dummy_image, 0

# 2. CNN Model - Using ResNet50 pre-trained model (unchanged)
class DrugPackageCNN(nn.Module):
    def __init__(self, num_classes=2):
        super(DrugPackageCNN, self).__init__()
        
        # Load pre-trained ResNet50
        self.resnet = resnet50(weights=ResNet50_Weights.DEFAULT)
        
        # Replace the final fully connected layer
        num_features = self.resnet.fc.in_features
        self.resnet.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )
        
        # Freeze early layers to speed up training and prevent overfitting
        for param in list(self.resnet.parameters())[:-36]:  # Freeze all but the last 2 layers
            param.requires_grad = False
    
    def forward(self, x):
        return self.resnet(x)

# 3. Training Function (unchanged)
def train_model(model, train_loader, valid_loader, criterion, optimizer, scheduler, num_epochs, device):
    model.to(device)
    
    # For tracking metrics
    train_losses = []
    valid_losses = []
    valid_accuracies = []
    
    best_valid_accuracy = 0.0
    patience = 5  # For early stopping
    counter = 0
    
    # For mixed precision training
    scaler = torch.cuda.amp.GradScaler() if device.type == 'cuda' else None
    
    for epoch in range(num_epochs):
        # Training phase
        model.train()
        running_loss = 0.0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            # Zero the parameter gradients
            optimizer.zero_grad()
            
            # Mixed precision training if using CUDA
            if scaler is not None:
                with torch.cuda.amp.autocast():
                    outputs = model(inputs)
                    loss = criterion(outputs, labels)
                
                # Scale the gradients and update
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                # Regular training if not using CUDA
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
            
            running_loss += loss.item() * inputs.size(0)
        
        # Step the learning rate scheduler
        if scheduler is not None:
            scheduler.step()
        
        epoch_train_loss = running_loss / len(train_loader.dataset)
        train_losses.append(epoch_train_loss)
        
        # Validation phase
        model.eval()
        running_loss = 0.0
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for inputs, labels in valid_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                running_loss += loss.item() * inputs.size(0)
                
                _, preds = torch.max(outputs, 1)
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        epoch_valid_loss = running_loss / len(valid_loader.dataset)
        valid_losses.append(epoch_valid_loss)
        
        # Calculate accuracy
        accuracy = accuracy_score(all_labels, all_preds)
        valid_accuracies.append(accuracy)
        
        print(f'Epoch {epoch+1}/{num_epochs}:')
        print(f'Train Loss: {epoch_train_loss:.4f}')
        print(f'Valid Loss: {epoch_valid_loss:.4f}')
        print(f'Valid Accuracy: {accuracy:.4f}')
        
        # Save the best model
        if accuracy > best_valid_accuracy:
            best_valid_accuracy = accuracy
            torch.save(model.state_dict(), 'best_drug_package_model.pth')
            print(f'Model saved with accuracy: {accuracy:.4f}')
            counter = 0
        else:
            counter += 1
            if counter >= patience:
                print(f"Early stopping at epoch {epoch+1}")
                break
        
        print('-' * 40)
    
    return train_losses, valid_losses, valid_accuracies

# 4. Evaluation Function (unchanged)
def evaluate_model(model, test_loader, device, class_names=['Authentic', 'Counterfeit']):
    model.eval()
    all_preds = []
    all_labels = []
    all_probs = []
    
    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            outputs = model(inputs)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            _, preds = torch.max(outputs, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())
    
    # Calculate metrics
    accuracy = accuracy_score(all_labels, all_preds)
    precision = precision_score(all_labels, all_preds, average='weighted')
    recall = recall_score(all_labels, all_preds, average='weighted')
    f1 = f1_score(all_labels, all_preds, average='weighted')
    
    print(f'Test Accuracy: {accuracy:.4f}')
    print(f'Test Precision: {precision:.4f}')
    print(f'Test Recall: {recall:.4f}')
    print(f'Test F1 Score: {f1:.4f}')
    
    # Confusion matrix calculations
    cm = confusion_matrix(all_labels, all_preds)
    print("Confusion Matrix:")
    print(cm)
    
    return accuracy, precision, recall, f1, all_probs

# 5. Single Image Prediction Function
def predict_drug_package(model, image_path, transform, device, class_names=['Authentic', 'Counterfeit']):
    model.eval()
    
    try:
        # Load and preprocess the image
        image = Image.open(image_path).convert('RGB')
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            probs = torch.nn.functional.softmax(outputs, dim=1)
            prob_values, preds = torch.max(probs, 1)
        
        prediction = class_names[preds.item()]
        confidence = prob_values.item()
        
        # Generate a prediction report
        class_probabilities = probs[0].cpu().numpy()
        
        print("\n===== Drug Package Authentication Report =====")
        print(f"Image: {os.path.basename(image_path)}")
        print(f"Classification: {prediction.upper()}")
        print(f"Confidence: {confidence:.2%}")
        print("\nDetailed probabilities:")
        for i, class_name in enumerate(class_names):
            print(f"{class_name}: {class_probabilities[i]:.2%}")
        print("============================================\n")
        
        return prediction, confidence
        
    except Exception as e:
        print(f"Error during prediction: {e}")
        return None, 0

# 6. Split data function - to create train/val/test splits if necessary
def split_data_directory(input_dir, output_base_dir, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15):
    """
    Split a directory of images into train, validation and test sets
    while preserving the class structure.
    
    Args:
        input_dir (str): Directory containing class subfolders
        output_base_dir (str): Base directory where train/val/test folders will be created
        train_ratio (float): Proportion of data for training
        val_ratio (float): Proportion of data for validation
        test_ratio (float): Proportion of data for testing
    """
    import shutil
    import random
    
    # Ensure ratios add up to 1
    assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-5, "Ratios must sum to 1"
    
    # Create output directories
    os.makedirs(output_base_dir, exist_ok=True)
    train_dir = os.path.join(output_base_dir, 'train')
    val_dir = os.path.join(output_base_dir, 'val')
    test_dir = os.path.join(output_base_dir, 'test')
    
    os.makedirs(train_dir, exist_ok=True)
    os.makedirs(val_dir, exist_ok=True)
    os.makedirs(test_dir, exist_ok=True)
    
    # Get class folders
    class_dirs = [d for d in os.listdir(input_dir) 
                 if os.path.isdir(os.path.join(input_dir, d))]
    
    for class_name in class_dirs:
        # Create class subdirectories in each split
        os.makedirs(os.path.join(train_dir, class_name), exist_ok=True)
        os.makedirs(os.path.join(val_dir, class_name), exist_ok=True)
        os.makedirs(os.path.join(test_dir, class_name), exist_ok=True)
        
        # Get all image files in this class
        class_dir = os.path.join(input_dir, class_name)
        valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff')
        image_files = [f for f in os.listdir(class_dir) 
                      if f.lower().endswith(valid_extensions)]
        
        # Shuffle images
        random.shuffle(image_files)
        
        # Calculate split indices
        n_train = int(len(image_files) * train_ratio)
        n_val = int(len(image_files) * val_ratio)
        
        # Split into train, val, test
        train_files = image_files[:n_train]
        val_files = image_files[n_train:n_train + n_val]
        test_files = image_files[n_train + n_val:]
        
        # Copy files to respective directories
        for f in train_files:
            shutil.copy2(os.path.join(class_dir, f), os.path.join(train_dir, class_name, f))
        
        for f in val_files:
            shutil.copy2(os.path.join(class_dir, f), os.path.join(val_dir, class_name, f))
        
        for f in test_files:
            shutil.copy2(os.path.join(class_dir, f), os.path.join(test_dir, class_name, f))
        
        print(f"Class {class_name}: {len(train_files)} train, {len(val_files)} val, {len(test_files)} test")

# 7. Main Function
def main(data_dir, train_model_flag=True, split_data=False):
    # Set device
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Define transforms for evaluation
    eval_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Split data if requested
    if split_data:
        print("Splitting data into train/val/test sets...")
        split_data_directory(data_dir, os.path.join(os.path.dirname(data_dir), 'split_data'))
        data_dir = os.path.join(os.path.dirname(data_dir), 'split_data')
        
    # Check if we need to train the model or just use a pre-trained one
    if train_model_flag:
        # Define data directories
        train_dir = os.path.join(data_dir, 'train') if os.path.exists(os.path.join(data_dir, 'train')) else data_dir
        valid_dir = os.path.join(data_dir, 'val') if os.path.exists(os.path.join(data_dir, 'val')) else None
        test_dir = os.path.join(data_dir, 'test') if os.path.exists(os.path.join(data_dir, 'test')) else None
        
        # If no separate validation set, use a portion of training data
        use_train_valid_split = valid_dir is None
        
        # Define transformations with data augmentation for training
        train_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(p=0.2),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1, hue=0.05),
            transforms.RandomAffine(degrees=0, translate=(0.1, 0.1), scale=(0.9, 1.1)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Create datasets
        train_dataset = DrugPackageDataset(train_dir, transform=train_transform)
        
        # Get class names from dataset
        class_names = train_dataset.class_names if hasattr(train_dataset, 'class_names') else ['Authentic', 'Counterfeit']
        print(f"Using class names: {class_names}")
        
        # Handle validation and test sets
        if use_train_valid_split:
            # Split training data into train and validation
            from torch.utils.data import random_split
            
            # Use 80% for training, 20% for validation
            train_size = int(0.8 * len(train_dataset))
            valid_size = len(train_dataset) - train_size
            
            # Random split
            train_dataset, valid_dataset = random_split(
                train_dataset, [train_size, valid_size], 
                generator=torch.Generator().manual_seed(42)
            )
            print(f"Split dataset: {train_size} training, {valid_size} validation samples")
            
            # No separate test set in this case (will use validation data for testing)
            test_dataset = valid_dataset
        else:
            # Use provided validation and test directories
            valid_dataset = DrugPackageDataset(valid_dir, transform=eval_transform)
            test_dataset = DrugPackageDataset(test_dir, transform=eval_transform) if test_dir else valid_dataset
            
        # Calculate class weights to handle imbalanced data if needed
        if hasattr(train_dataset, 'labels'):
            class_counts = [train_dataset.labels.count(i) for i in range(len(class_names))]
        else:
            # For random_split dataset, we need to check the underlying dataset
            if use_train_valid_split:
                class_counts = [train_dataset.dataset.labels.count(i) for i in range(len(class_names))]
            else:
                class_counts = [0, 0]  # Default if can't determine
                
        # Calculate weights only if we have class counts
        if sum(class_counts) > 0:
            total_samples = sum(class_counts)
            class_weights = [total_samples / (len(class_counts) * count) if count > 0 else 1.0 for count in class_counts]
            class_weights_tensor = torch.FloatTensor(class_weights).to(device)
            
            print(f"Class distribution: {class_counts}")
            print(f"Class weights: {class_weights}")
        else:
            class_weights_tensor = None
        
        # Create data loaders
        train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=4, pin_memory=True)
        valid_loader = DataLoader(valid_dataset, batch_size=32, shuffle=False, num_workers=4, pin_memory=True)
        test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False, num_workers=4, pin_memory=True)
        
        # Create model
        model = DrugPackageCNN(num_classes=len(class_names))
        
        # Define loss function with class weights if available
        criterion = nn.CrossEntropyLoss(weight=class_weights_tensor) if class_weights_tensor is not None else nn.CrossEntropyLoss()
        
        # Optimizer with different learning rates for frozen and unfrozen layers
        params_to_update = []
        params_to_fine_tune = []
        
        for name, param in model.named_parameters():
            if param.requires_grad:
                if "fc" in name:
                    params_to_update.append(param)
                else:
                    params_to_fine_tune.append(param)
        
        optimizer = optim.AdamW([
            {'params': params_to_fine_tune, 'lr': 1e-5},
            {'params': params_to_update, 'lr': 1e-3}
        ], weight_decay=1e-4)
        
        # Learning rate scheduler
        scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=20)
        
        # Train the model
        print("Starting training...")
        train_losses, valid_losses, valid_accuracies = train_model(
            model, train_loader, valid_loader, criterion, optimizer, scheduler, num_epochs=30, device=device
        )
        
        # Load the best model for evaluation
        model = DrugPackageCNN(num_classes=len(class_names))
        model.load_state_dict(torch.load('best_drug_package_model.pth', map_location=device))
        model.to(device)
        
        # Evaluate the model
        print("\nEvaluating model on test set...")
        accuracy, precision, recall, f1, all_probs = evaluate_model(model, test_loader, device, class_names)
    else:
        # Just load a pre-trained model
        if os.path.exists('best_drug_package_model.pth'):
            # Try to determine number of classes
            try:
                temp_dataset = DrugPackageDataset(data_dir, transform=None)
                num_classes = len(temp_dataset.class_names)
                class_names = temp_dataset.class_names
            except:
                # Default to binary classification
                num_classes = 2
                class_names = ['Authentic', 'Counterfeit']
            
            model = DrugPackageCNN(num_classes=num_classes)
            model.load_state_dict(torch.load('best_drug_package_model.pth', map_location=device))
            model.to(device)
            print("Loaded pre-trained model from 'best_drug_package_model.pth'")
            print(f"Using class names: {class_names}")
        else:
            print("No pre-trained model found at 'best_drug_package_model.pth'. Please train the model first.")
            return None
    
    # Create and return the prediction function
    def predict_new_image(image_path):
        return predict_drug_package(model, image_path, eval_transform, device, class_names)
    
    return predict_new_image

# Function to check a single image after the model is trained
def check_single_image(image_path, model_path='best_drug_package_model.pth', class_names=None):
    """
    Check if a drug package image is authentic or counterfeit
    
    Args:
        image_path (str): Path to the image to check
        model_path (str): Path to the trained model
        class_names (list): List of class names (optional)
        
    Returns:
        tuple: (prediction, confidence)
    """
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    
    # Check if model exists
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}. Please train the model first.")
        return None, 0
    
    # Default class names if not provided
    if class_names is None:
        class_names = ['Authentic', 'Counterfeit']
    
    # Load model
    model = DrugPackageCNN(num_classes=len(class_names))
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()
    
    # Define transform
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Make prediction
    return predict_drug_package(model, image_path, transform, device, class_names)

# If this script is run directly
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Drug Package Authentication System')
    parser.add_argument('--data-dir', type=str, default='./data', 
                        help='Directory containing images (or train/val/test subfolders)')
    parser.add_argument('--train', action='store_true', help='Train the model')
    parser.add_argument('--split-data', action='store_true', help='Split data into train/val/test')
    parser.add_argument('--check', type=str, help='Path to image for checking')
    
    args = parser.parse_args()
    
    if args.check:
        # User wants to check a single image
        print(f"Checking image: {args.check}")
        prediction, confidence = check_single_image(args.check)
        if prediction:
            print(f"Result: {prediction} (Confidence: {confidence:.2%})")
    elif args.train or args.split_data:
        # User wants to train the model or split data
        predict_func = main(args.data_dir, train_model_flag=args.train, split_data=args.split_data)
        print("\nModel training completed. You can now use --check to check images.")
    else:
        # No arguments provided, default to loading model and waiting for input
        predict_func = main(args.data_dir, train_model_flag=False)
        if predict_func:
            while True:
                img_path = input("\nEnter the path to an image to check (or 'quit' to exit): ")
                if img_path.lower() in ['quit', 'exit', 'q']:
                    break
                if os.path.exists(img_path):
                    prediction, confidence = predict_func(img_path)
                    if prediction:
                        print(f"Result: {prediction} (Confidence: {confidence:.2%})")
                else:
                    print(f"Image not found at: {img_path}")