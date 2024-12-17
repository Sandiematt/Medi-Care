import Icon from 'react-native-vector-icons/AntDesign';
import FeatherIcon from 'react-native-vector-icons/Feather';

export const icons = {
    index: (props) => <Icon name="home" size={26} {...props} />,
    explore: (props) => <FeatherIcon name="compass" size={26} {...props} />,
    create: (props) => <Icon name="pluscircleo" size={26} {...props} />,
    profile: (props) => <Icon name="user" size={26} {...props} />,
};
