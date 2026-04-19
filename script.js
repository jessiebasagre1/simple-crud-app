const productInfo = document.querySelector('.product-info');
const productForm = document.querySelector('.add-product');
const editForm = document.querySelector('.edit-product');
const result = document.querySelector('.result');

// Close buttons
document.getElementById('closeAddForm').addEventListener('click', closeForms);
document.getElementById('closeEditForm').addEventListener('click', closeForms);

function closeForms() {
    productForm.classList.remove('active');
    editForm.classList.remove('active');
    productInfo.classList.remove('blur');
}

let editId = null;

// Show add form
function showForm() {
    productForm.classList.add('active');
    productInfo.classList.add('blur');
}

// FETCH PRODUCTS
const fetchProduct = async () => {
    try {
        const { data } = await axios.get('/api/products');
        const rows = data.data.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>${product.qty}</td>
                <td>₱${parseFloat(product.price).toFixed(2)}</td>
                <td>
                    <button onclick="editProduct('${product._id}')" class="edit-btn">Edit</button>
                    <button onclick="deleteProduct('${product._id}')" class="delete-btn">Delete</button>
                </td>
            </tr>
        `);
        result.innerHTML = rows.join('');
    } catch (err) {
        console.error('Error fetching products:', err);
        result.innerHTML = '<tr><td colspan="4">Error loading products</td></tr>';
    }
};

// CREATE PRODUCT
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const newProduct = {
            name: formData.get('productName'),
            qty: parseInt(formData.get('productQty')),
            price: parseFloat(formData.get('productPrice'))
        };

        await axios.post('/api/products', newProduct);
        
        e.target.reset();
        closeForms();
        fetchProduct();
    } catch (err) {
        console.error('Error creating product:', err);
        alert('Error adding product: ' + err.response?.data?.message);
    }
});

// EDIT PRODUCT
window.editProduct = async (id) => {
    try {
        editForm.classList.add('active');
        productInfo.classList.add('blur');
        
        const { data } = await axios.get(`/api/products/${id}`);
        editId = id;
        
        document.getElementById('editName').value = data.name;
        document.getElementById('editQty').value = data.qty;
        document.getElementById('editPrice').value = data.price;
    } catch (err) {
        console.error('Error fetching product:', err);
    }
};

// UPDATE PRODUCT
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const updateProduct = {
            name: document.getElementById('editName').value,
            qty: parseInt(document.getElementById('editQty').value),
            price: parseFloat(document.getElementById('editPrice').value)
        };

        await axios.put(`/api/products/${editId}`, updateProduct);
        
        closeForms();
        fetchProduct();
    } catch (err) {
        console.error('Error updating product:', err);
        alert('Error updating product: ' + err.response?.data?.message);
    }
});

// DELETE PRODUCT
window.deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await axios.delete(`/api/products/${id}`);
        fetchProduct();
    } catch (err) {
        console.error('Error deleting product:', err);
        alert('Error deleting product');
    }
};

// Initial load
fetchProduct();