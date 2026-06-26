import db from '../../entities/index.js';

const getCart = async (userId) => {
    const { Cart, CartItem, Product } = db;
    let cart = await Cart.findOne({
        where: { userId },
        include: [{
            model: CartItem,
            as: 'items',
            attributes: ['id', 'productId', 'quantity', 'price'],
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price', 'thumbnail', 'stock'] 
            }]
        }]
    });

    if (!cart) {
        cart = await Cart.create({ userId });
        cart.setDataValue('items', []); 
    }

    return cart;
};

const addToCart = async (userId, productId, quantity = 1) => {
    const { Cart, CartItem, Product } = db;
    const product = await Product.findByPk(productId);
    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (product.stock < quantity) throw new Error('Số lượng sản phẩm trong kho không đủ');

    let [cart] = await Cart.findOrCreate({ where: { userId } });

    let cartItem = await CartItem.findOne({
        where: { cartId: cart.id, productId }
    });

    if (cartItem) {
        cartItem.quantity += parseInt(quantity);
        if (product.stock < cartItem.quantity) throw new Error('Vượt quá số lượng sản phẩm trong kho');
        await cartItem.save();
    } else {
        cartItem = await CartItem.create({
            cartId: cart.id,
            productId,
            quantity,
            price: product.price 
        });
    }

    return cartItem;
};

const updateCartItem = async (userId, cartItemId, quantity) => {
    const { Cart, CartItem, Product } = db;
    const cartItem = await CartItem.findOne({
        where: { id: cartItemId },
        include: [
            { model: Cart, as: 'cart', where: { userId }, required: true },
            { model: Product, as: 'product', required: true }
        ] 
    });

    if (!cartItem) throw new Error('Sản phẩm không tồn tại trong giỏ hàng');
    
    const newQuantity = Number(quantity);
    if (isNaN(newQuantity) || newQuantity < 1) {
        throw new Error('Số lượng không hợp lệ');
    }

    if (cartItem.product.stock < newQuantity) {
        throw new Error('Số lượng yêu cầu vượt quá số lượng tồn kho.');
    }

    cartItem.quantity = newQuantity;
    await cartItem.save();
    return cartItem;
};

const deleteCartItem = async (userId, cartItemId) => {
    const { Cart, CartItem } = db;
    const cartItem = await CartItem.findOne({
        where: { id: cartItemId },
        include: [{ model: Cart, as: 'cart', where: { userId } }]
    });
    if (!cartItem) throw new Error('Không tìm thấy sản phẩm để xóa');
    await cartItem.destroy();
};

export default { getCart, addToCart, updateCartItem, deleteCartItem };