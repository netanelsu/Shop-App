import React, {useEffect, useState} from "react";
import { 
    StyleSheet, 
    View, 
    ActivityIndicator, 
    FlatList, 
    Platform,
    Text 
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { HeaderButtons, Item } from "react-navigation-header-buttons";

import CustomHeaderButton from '../../components/UI/HeaderButton';
import OrderItem from "../../components/shop/OrderItem";
import * as OrdersActions from '../../store/actions/orders';
import Colors from "../../constans/Colors";

const OrdersScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    const orders = useSelector(state => state.orders.orders);
    const dispatch = useDispatch();

    useEffect(() => {
        setError(null);
        setIsLoading(true);
        dispatch(OrdersActions.fetchOrders()).then(() => {
            setIsLoading(false);
        }).catch((err) => {
            setError(err.message);
        });
    }, [dispatch, setError, setIsLoading]);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size='large' color={Colors.primary}/>
            </View>
        );
    };

    if (!isLoading && orders.length == 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.text}>No orders found!  </Text>
            </View>
        );
    }

    return (
        <FlatList 
            data={orders}
            renderItem={itemData => 
                <OrderItem 
                    amount={itemData.item.totalAmount}
                    date={itemData.item.readableDate}
                    items={itemData.item.items}
                />
            }
        />
    );
};

OrdersScreen.navigationOptions = navData => {
    return {
        headerTitle: 'Your Orders',
        headerLeft: () => <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item 
                title='Menu'
                iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
                onPress={() => {
                    navData.navigation.toggleDrawer();
                }}
            />
        </HeaderButtons>,
    };
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


export default OrdersScreen;