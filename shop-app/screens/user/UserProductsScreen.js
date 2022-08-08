import React, {useState, useCallback, useEffect} from "react";
import { 
    FlatList, 
    Button, 
    Platform, 
    Alert,
    View,
    StyleSheet,
    Text,
    ActivityIndicator
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { HeaderButtons, Item } from "react-navigation-header-buttons";

import Colors from "../../constans/Colors";
import CustomHeaderButton from '../../components/UI/HeaderButton';
import ProductItem from "../../components/shop/ProductItem";
import * as productsActions from '../../store/actions/products';

const UserProductsScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    const userProducts = useSelector(state => state.products.userProducts);
    const dispatch = useDispatch();

    const loadProducts = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(productsActions.fetchProducts());
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setError, setIsLoading]);

    useEffect(() => {
        const willFocusSub = props.navigation.addListener('willFocus', loadProducts);
        return () => {
            willFocusSub.remove();
        };
    }, [loadProducts]);
 
    useEffect(() => {
        setIsLoading(true);
        loadProducts().then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadProducts]);

    const editProductHandler = (id) => {
        props.navigation.navigate('EditProduct', {productId: id});
    };
    
    const deleteHandler = (id) => {
        Alert.alert('Are you sure?', 'Do you want to delete this item?', [
            {text: 'No', style: 'default'},
            {
                text: 'Yes', 
                style: 'destructive', 
                onPress: () => {
                    dispatch(productsActions.deleteProduct(id));
                }
            },
        ])
    };

    if(error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.text}>An error ocurrred!</Text>
                <Button 
                    title='Try again' 
                    onPress={loadProducts} 
                    color={Colors.primary}
                />
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size='large' color={Colors.primary}/>
            </View>
        );
    };

    if (!isLoading && userProducts.length == 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.text}>No products found!</Text>
            </View>
        );
    }

    return (
        <FlatList 
            onRefresh={loadProducts}
            refreshing={isRefreshing}
            data={userProducts}
            renderItem={itemData =>
                <ProductItem 
                    image={itemData.item.imageUrl}
                    title={itemData.item.title}
                    price={itemData.item.price}
                    onSelect={() => {
                        editProductHandler(itemData.item.id);
                    }}
                >
                    <Button 
                        title="Edit" 
                        onPress={() => {
                            editProductHandler(itemData.item.id);
                        }}
                        color={Colors.primary}
                    />
                    <Button 
                        title="Delete" 
                        onPress={() => {
                            deleteHandler(itemData.item.id)
                        }}
                        color={Colors.primary}
                    />
                </ProductItem>
            }
        />
    );
};

UserProductsScreen.navigationOptions = navData => {
    return {
        headerTitle: 'Your Products',
        headerLeft: () => <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item 
                title='Menu'
                iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
                onPress={() => {
                    navData.navigation.toggleDrawer();
                }}
            />
        </HeaderButtons>,
        headerRight: () => <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item 
                title='Add'
                iconName={Platform.OS === 'android' ? 'md-add-circle-outline' : 'ios-add-circle-outline'} 
                onPress={() => {
                    navData.navigation.navigate('EditProduct');
                }}
            />
        </HeaderButtons>
    }
};

const styles = StyleSheet.create({
    centered: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    text: {
        fontFamily: 'open-sans-bold',
        fontSize: 16,
        textAlign: 'center'
    }
});

export default UserProductsScreen;