const addProductModal = document.querySelector('.addProductmodal');
const editProductModal = document.querySelector('.editProductmodal');
// const addProductBtn = document.querySelector('button.AddBtn');
// const addcloseBtn = document.querySelector('.addcloseBtn');                 
// const editcloseBtn = document.querySelector('.editcloseBtn');

//select form feilds
const productNameInput = document.querySelector("input[name='productName']");
const productPriceInput = document.querySelector("input[name='productPrice']");
const productCategorySelect = document.querySelectorAll("select[name='productCategory']");
const productDescriptionTextarea = document.querySelector("textarea[name='productDescription']");
const imageUrlInput = document.querySelector("input[name='imageUrl']");
const addProductForm = document.querySelector('.addProductForm');
const editProductForm = document.querySelector('.editProductForm');

//search

const searchInput = document.getElementById('searchInput');
const resultsPanel = document.getElementById('resultsPanel');
const resultsList = document.getElementById('resultsList');
const loadingSpinner = document.getElementById('loadingSpinner');
const searchForm = document.getElementById('searchForm');

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
    toast.className = `flex items-center px-4 py-3 text-white ${bgColor} rounded-xl shadow-lg toast-enter`;
    toast.innerHTML = `<span>${message}</span>`;
    
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.replace('toast-enter', 'toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};// addProductBtn.addEventListener('click', () => {
//     addProductModal.classList.remove('hidden');
// });

// addcloseBtn.addEventListener('click', () => {
//     addProductModal.classList.add('hidden');
//     // Clear form fields
//     productNameInput.value = '';
//     productPriceInput.value = '';
//     productCategorySelect.value = '';
//     productDescriptionTextarea.value = '';
//     imageUrlInput.value = '';
// })
let AllCategories = [];

//getting all categories from fakestore api
const getAllCategories = (async () => {
    try {
        const response = await fetch('https://fakestoreapi.com/products/categories');
        AllCategories = await response.json();
        displayCategories();
        console.log(AllCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
})();

let Allproducts = [];
// getting all products from fakestore api or localStorage
const getAllProducts = (async () => {
    try {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts !== null) {
            Allproducts = JSON.parse(storedProducts);
            renderTable(Allproducts);
        } else {
            const response = await fetch('https://fakestoreapi.com/products');
            Allproducts = await response.json();
            localStorage.setItem('products', JSON.stringify(Allproducts));
            renderTable(Allproducts);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
})();




// a general function for showing modals
async function showModal(modal, id = 0) {
    const modalEl = document.querySelector(modal);
    modalEl.classList.remove('opacity-0', 'pointer-events-none');
    const modalContent = modalEl.querySelector('.modal-content');
    if (modalContent) {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }

    if (id) {
        try {
            const product = getProduct(id);
            // Select the inputs SPECIFICALLY inside the edit modal!
            editProductForm.querySelector("input[name='productName']").value = product.title;
            editProductForm.querySelector("input[name='productPrice']").value = product.price;
            editProductForm.querySelector("select[name='productCategory']").value = product.category;
            editProductForm.querySelector("textarea[name='productDescription']").value = product.description;
            editProductForm.querySelector("input[name='imageUrl']").value = product.image;
            editProductForm.setAttribute('prod_id', id);
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    }
};


// a general function for closing modals
function closeModal(modal) {
    const modalEl = document.querySelector(modal);
    modalEl.classList.add('opacity-0', 'pointer-events-none');
    const modalContent = modalEl.querySelector('.modal-content');
    if (modalContent) {
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
    }

    // Clear form fields
    productNameInput.value = '';
    productPriceInput.value = '';
    // productCategorySelect.value = '';
    productDescriptionTextarea.value = '';
    imageUrlInput.value = '';
};

addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Basic Validation check
    if (!productNameInput.value || !productPriceInput.value) {
        showToast("Please fill in the required fields.", "error");
        return;
    }
    
    let selectedCategory = productCategorySelect.value;
    if (productCategorySelect instanceof NodeList) {
        selectedCategory = productCategorySelect[0] ? productCategorySelect[0].value : 'Electronics';
    }

    const newProduct = {
        id: Date.now(),
        title: productNameInput.value.trim(),
        price: parseFloat(productPriceInput.value),
        category: selectedCategory,
        description: productDescriptionTextarea.value.trim(),
        image: imageUrlInput.value.trim() || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKEAAACUCAMAAADMOLmaAAAAMFBMVEX///+/v7/w8PD7+/u6urre3t7Hx8fQ0NDDw8P4+Pjl5eXT09P09PTh4eHNzc3KysoB01hgAAAC1ElEQVR4nO3a2ZarIBAF0IBEnIL//7dXjQOzRkp03T7nsdMLdwtFienXC0EQBEEuS3djeH0AWJTsvog3hBBCCCGE/6ewUjJL+tPC/kiXJEgjIEwNhOmBMD0QpgfC9ECYHgjT8/eENW+ahhfPFTY9E0Iw1TxUWKtlNNGSrQFKYbECh9HkE4VvpkVQTTShsK50ISsPz/ObZxJuQ30Tva6WrmozCVtLeGS8MaWoujxCeU44Cj5PFnbj6i0jWzyh8GMJDxVzIadrR9YsoZCbwOjiWjP/WZFaodwPWx0oogW6pFt+PfznUAo7fUOsDn09I5dfD9cKaV/mbB2tPLQbNrHRrhC++HBPxmebSh5qKNpNDzdJ4qevgrdSyXgb27LOcWzZ3vmM/Ta2p9BwmYS+x0VuPGkEL59H2Ajldg3JjPSBvpJFONwtofZaUKgHZRFOW7k075H1NBmulRzC7zWEMY2FYk78fSWDsC6Xm6QRnTkOAjIIt3a9TXRnz/GYylsr1wu5fgCcDYVVx/PH3lq5XtjriJn48QGHT28RWgtOjT+r3UX4nWZft7xaaC+4sVwK+8y1xkcgF1pPDa2jaLVnLjtlBuFQFzrRgxPK3/m61vS02e4qXgYlR//Z92f/Z92f/Z92f/Z92f9bVAAAAAElFTkSuQmCC' // Fallback image
    };

    // 2. Add to your table/state
    addProduct(newProduct);

    // 3. UI Cleanup
    addProductForm.reset(); // Clears all fields

    // 4. Close the modal
    closeModal('.addProductmodal');
});

// handling submit of edit form

editProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log(e);

    const id = editProductForm.getAttribute('prod_id');
    await updateProduct(id)
    renderTable(Allproducts);
    closeModal('.editProductmodal');

    console.log(id);
})



let searchTimeout;
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    if (query.length > 0) {
        // Show panel and loading spinner
        resultsPanel.classList.remove('hidden');
        resultsList.innerHTML = ''; // Clear old results
        loadingSpinner.classList.remove('hidden');

        // Simulate a quick search delay (e.g., 300ms)
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const filtered = Allproducts.filter(item => item.title.toLowerCase().includes(query));
            
            loadingSpinner.classList.add('hidden');
            displayResults(filtered);
        }, 300);
    } else {
        resultsPanel.classList.add('hidden');
        clearTimeout(searchTimeout);
    }
});

function displayResults(results) {
    if (results.length === 0) {
        resultsList.innerHTML = `<li class="p-3 text-gray-500 text-sm">No items found</li>`;
        return;
    }

    resultsList.innerHTML = results.map(item => `
        <li class="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-none animate-fadeIn transition-colors">
            ${item.title}
        </li>
    `).join('');
}


searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.toLowerCase();
   const filtered = Allproducts.filter(item => item.title.toLowerCase().includes(query));
    renderTable(filtered);
  
});







function addProduct(product) {
    Allproducts.push(product);
    localStorage.setItem('products', JSON.stringify(Allproducts));
    renderTable(Allproducts);
    showToast("Product added successfully!");
};


function getProduct(id) {


    try {
        const product = Allproducts.find(product => product.id === id);
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
    }
}


function renderTable(Array) {
    const tableBody = document.querySelector('#productTable tbody');
    if (!tableBody) return;
    
    if (Array.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center space-y-3">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        <span class="text-lg font-medium">No products found. Add one!</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = '';
    Array.forEach((product, index) => {
        const newRow = document.createElement('tr');
        newRow.className = 'border-b hover:-translate-y-1 hover:shadow-lg transition-all duration-300 bg-white animate-fadeIn opacity-0';
        newRow.style.animationDelay = `${index * 0.05}s`;
        newRow.style.animationFillMode = 'forwards';
        newRow.setAttribute('id', product.id);
        
        let desc = product.description;
        if (desc && desc.length > 50) {
            desc = desc.substring(0, 50) + '...';
        }

        newRow.innerHTML = `
                <td class="px-4 py-3">${product.id}</td>
                <td class="px-4 py-3">
                    <img
                        src="${product.image}"
                        alt="${product.title}" class="w-16 h-16 object-cover rounded-lg"></td>
                <td class="px-4 py-3 font-medium text-gray-900">${product.title}</td>
                <td class="px-4 py-3 text-green-600 font-semibold">$${Number(product.price).toFixed(2)}</td>
                <td class="px-4 py-3"><span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">${product.category}</span></td>
                <td class="px-4 py-3 text-sm text-gray-500">${desc}</td>
                <td class="px-4 py-3 space-x-2">
                    <button class="bg-blue-50 hover:bg-blue-100 focus:ring-4 focus:ring-blue-100 text-blue-600 font-medium py-1.5 px-3 rounded-lg transition-colors border border-blue-200 shadow-sm" onclick="showModal('.editProductmodal', ${product.id})">Edit</button>
                    <button class="bg-red-50 hover:bg-red-100 focus:ring-4 focus:ring-red-100 text-red-600 font-medium py-1.5 px-3 rounded-lg transition-colors border border-red-200 shadow-sm" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
        `;
        tableBody.appendChild(newRow);
    });
};


function displayCategories() {
    productCategorySelect.forEach(select => {
        select.innerHTML = '';
        AllCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    });
};


function updateProduct(id) {
    const updatedProduct = {
        id: parseInt(id) || id,
        title: editProductForm.querySelector("input[name='productName']").value.trim(),
        price: parseFloat(editProductForm.querySelector("input[name='productPrice']").value),
        category: editProductForm.querySelector("select[name='productCategory']").value,
        description: editProductForm.querySelector("textarea[name='productDescription']").value.trim(),
        image: editProductForm.querySelector("input[name='imageUrl']").value.trim() || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKEAAACUCAMAAADMOLmaAAAAMFBMVEX///+/v7/w8PD7+/u6urre3t7Hx8fQ0NDDw8P4+Pjl5eXT09P09PTh4eHNzc3KysoB01hgAAAC1ElEQVR4nO3a2ZarIBAF0IBEnIL//7dXjQOzRkp03T7nsdMLdwtFienXC0EQBEEuS3djeH0AWJTsvog3hBBCCCGE/6ewUjJL+tPC/kiXJEgjIEwNhOmBMD0QpgfC9ECYHgjT8/eENW+ahhfPFTY9E0Iw1TxUWKtlNNGSrQFKYbECh9HkE4VvpkVQTTShsK50ISsPz/ObZxJuQ30Tva6WrmozCVtLeGS8MaWoujxCeU44Cj5PFnbj6i0jWzyh8GMJDxVzIadrR9YsoZCbwOjiWjP/WZFaodwPWx0oogW6pFt+PfznUAo7fUOsDn09I5dfD9cKaV/mbB2tPLQbNrHRrhC++HBPxmebSh5qKNpNDzdJ4qevgrdSyXgb27LOcWzZ3vmM/Ta2p9BwmYS+x0VuPGkEL59H2Ajldg3JjPSBvpJFONwtofZaUKgHZRFOW7k075H1NBmulRzC7zWEMY2FYk78fSWDsC6Xm6QRnTkOAjIIt3a9TXRnz/GYylsr1wu5fgCcDYVVx/PH3lq5XtjriJn48QGHT28RWgtOjT+r3UX4nWZft7xaaC+4sVwK+8y1xkcgF1pPDa2jaLVnLjtlBuFQFzrRgxPK3/m61vS02e4qXgYlR//Z92f/Z92f/Z92f/Z92f9bVAAAAAElFTkSuQmCC'
    };

    Allproducts = Allproducts.map(product => product.id == id ? updatedProduct : product);
    localStorage.setItem('products', JSON.stringify(Allproducts));
    showToast("Product updated successfully!");
};


function deleteProduct(id) {
    Allproducts = Allproducts.filter(product => product.id != id);
    localStorage.setItem('products', JSON.stringify(Allproducts));
    renderTable(Allproducts);
    showToast("Product deleted successfully!", "error");
};





