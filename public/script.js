class ProductManager {
    constructor() {
        this.apiUrl = '/api/products';
        this.init();
    }

    init() {
        this.loadProducts();
        this.bindEvents();
    }

    bindEvents() {
        // Add button
        document.getElementById('addBtn').addEventListener('click', () => {
            this.showModal('addModal');
        });

        // Add form
        document.getElementById('addForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createProduct();
        });

        // Edit form
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProduct();
        });

        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                this.hideModals();
            });
        });

        // Close on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModals();
            }
        });
    }

    async loadProducts() {
        try {
            const response = await axios.get(this.apiUrl);
            this.renderProducts(response.data.data);
        } catch (error) {
            console.error('Load error:', error);
            this.showError('Failed to load products');
        }
    }

    renderProducts(products) {
        const tbody = document.getElementById('productsTable');
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading">No products found. Add one to get started! 🎉</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <strong>${product.name}</strong>
                    <br><small>ID: ${product._id.slice(-6)}</small>
                </td>
                <td>
                    <span class="stock-${product.qty > 5 ? 'good' : 'low'}">
                        ${product.qty}
                    </span>
                </td>
                <td>₱${parseFloat(product.price).toFixed(2)}</td>
                <td>
                    <button onclick="app.editProduct('${product._id}')" class="btn btn-success">✏️ Edit</button>
                    <button onclick="app.deleteProduct('${product._id}')" class="btn btn-danger">🗑️ Delete</button>
                </td>
            </tr>
        `).join('');
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    async createProduct() {
        const formData = {
            name: document.getElementById('name').value,
            qty: parseInt(document.getElementById('qty').value),
            price: parseFloat(document.getElementById('price').value)
        };

        try {
            await axios.post(this.apiUrl, formData);
            this.hideModals();
            this.loadProducts();
            document.getElementById('addForm').reset();
            this.showSuccess('Product added successfully! 🎉');
        } catch (error) {
            this.showError(error.response?.data?.error || 'Failed to add product');
        }
    }

    async editProduct(id) {
        try {
            const response = await axios.get(`${this.apiUrl}/${id}`);
            const product = response.data;
            
            document.getElementById('editId').value = id;
            document.getElementById('editName').value = product.name;
            document.getElementById('editQty').value = product.qty;
            document.getElementById('editPrice').value = product.price;
            
            this.showModal('editModal');
        } catch (error) {
            this.showError('Failed to load product');
        }
    }

    async updateProduct() {
        const id = document.getElementById('editId').value;
        const formData = {
            name: document.getElementById('editName').value,
            qty: parseInt(document.getElementById('editQty').value),
            price: parseFloat(document.getElementById('editPrice').value)
        };

        try {
            await axios.put(`${this.apiUrl}/${id}`, formData);
            this.hideModals();
            this.loadProducts();
            this.showSuccess('Product updated successfully! ✅');
        } catch (error) {
            this.showError(error.response?.data?.error || 'Failed to update product');
        }
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await axios.delete(`${this.apiUrl}/${id}`);
            this.loadProducts();
            this.showSuccess('Product deleted successfully! 🗑️');
        } catch (error) {
            this.showError('Failed to delete product');
        }
    }

    showSuccess(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: #51cf66; color: white; padding: 15px 20px;
            border-radius: 10px; z-index: 10000; font-weight: bold;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: #ff6b6b; color: white; padding: 15px 20px;
            border-radius: 10px; z-index: 10000; font-weight: bold;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
}

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProductManager();
});