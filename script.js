// State Data Utama
let allCarsData = [];
const API_ENDPOINT = 'https://api-web.dnccudinus.org/api/mobil';

// Fallback Gambar Berkualitas Tinggi (Unsplash)
const fallbackImages = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
];

// Elemen DOM
const carGrid = document.getElementById('carGrid');
const searchInput = document.getElementById('searchInput');
const brandFilter = document.getElementById('brandFilter');
const sortFilter = document.getElementById('sortFilter');
const totalCarsBadge = document.getElementById('totalCarsBadge');
const carModal = document.getElementById('carModal');
const closeModalBtn = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// Helper: Format Angka ke Rupiah
function formatRupiah(number) {
  if (isNaN(number) || number === null) return 'Hubungi Dealer';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

// Integrasi API (fetch)
async function fetchCarData() {
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (Array.isArray(result)) {
      allCarsData = result;
    } else if (result.data && Array.isArray(result.data)) {
      allCarsData = result.data;
    } else if (result.hasil && Array.isArray(result.hasil)) {
      allCarsData = result.hasil;
    } else {
      allCarsData = [];
    }

    populateBrandFilter(allCarsData);
    renderCars(allCarsData);

  } catch (error) {
    console.error('Fetch Error:', error);
    carGrid.innerHTML = `
      <div class="state-container">
        <h3 style="color: #ef4444; margin-bottom: 0.5rem;">Gagal Memuat Data</h3>
        <p>${error.message}</p>
        <p style="font-size: 0.85rem; margin-top: 0.5rem;">Pastikan koneksi internet terhubung atau server API sedang aktif.</p>
      </div>
    `;
    totalCarsBadge.textContent = '0 Mobil';
  }
}

// Manipulasi DOM: Mengisi Filter Brand secara Dinamis
function populateBrandFilter(cars) {
  const brands = new Set();
  cars.forEach(car => {
    if (car.brand) brands.add(car.brand.toUpperCase());
  });

  brandFilter.innerHTML = '<option value="ALL">Semua Brand</option>';
  brands.forEach(brand => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    brandFilter.appendChild(option);
  });
}

// Manipulasi DOM: Render Kartu Mobil
function renderCars(cars) {
  carGrid.innerHTML = '';
  totalCarsBadge.textContent = `Menampilkan ${cars.length} Mobil`;

  if (cars.length === 0) {
    carGrid.innerHTML = `
      <div class="state-container">
        <h3>Mobil Tidak Ditemukan</h3>
        <p>Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  cars.forEach((car, index) => {
    const card = document.createElement('div');
    card.className = 'car-card';

    const imageUrl = car.foto || car.image || fallbackImages[index % fallbackImages.length];
    const carName = car.nama || car.nama_mobil || 'Mobil Showroom';
    const carBrand = (car.brand || 'ZAHRAH AMALIA').toUpperCase();
    const carPrice = car.harga ? formatRupiah(car.harga) : 'Hubungi Dealer';
    const carYear = car.tahun || 'N/A';
    const carTrans = car.transmisi || 'N/A';
    const carFuel = car.bahan_bakar || car.bbm || 'N/A';
    const carStatus = car.status || 'Tersedia';

    card.innerHTML = `
      <div class="car-image-container">
        <img src="${imageUrl}" alt="${carName}" class="car-image" onerror="this.src='${fallbackImages[0]}'">
        <span class="status-badge">${carStatus}</span>
      </div>
      <div class="car-details">
        <span class="car-brand">${carBrand}</span>
        <h2 class="car-title">${carName}</h2>
        <div class="car-specs">
          <div><strong>Tahun:</strong> ${carYear}</div>
          <div><strong>Transmisi:</strong> ${carTrans}</div>
          <div><strong>BBM:</strong> ${carFuel}</div>
        </div>
        <div class="car-price">
          <span>${carPrice}</span>
          <button class="btn-detail" onclick="openCarModal(${index})">Detail</button>
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  carGrid.appendChild(fragment);
}

// Filter & Sorting Logic
function filterAndSortCars() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedBrand = brandFilter.value;
  const selectedSort = sortFilter.value;

  let filtered = allCarsData.filter(car => {
    const nameMatch = (car.nama || '').toLowerCase().includes(searchTerm);
    const brandMatch = (car.brand || '').toLowerCase().includes(searchTerm);
    const matchesSearch = nameMatch || brandMatch;

    const matchesBrand = (selectedBrand === 'ALL') || 
                         ((car.brand || '').toUpperCase() === selectedBrand);

    return matchesSearch && matchesBrand;
  });

  if (selectedSort === 'LOW') {
    filtered.sort((a, b) => (a.harga || 0) - (b.harga || 0));
  } else if (selectedSort === 'HIGH') {
    filtered.sort((a, b) => (b.harga || 0) - (a.harga || 0));
  }

  renderCars(filtered);
}

// Logic Modal
window.openCarModal = function(index) {
  const car = allCarsData[index];
  if (!car) return;

  const imageUrl = car.foto || car.image || fallbackImages[index % fallbackImages.length];

  modalBody.innerHTML = `
    <img src="${imageUrl}" alt="${car.nama}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;" onerror="this.src='${fallbackImages[0]}'">
    <span class="car-brand">${(car.brand || 'ZAHRAH AMALIA').toUpperCase()}</span>
    <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem;">${car.nama || 'Mobil Showroom'}</h2>
    <p style="font-size: 1.4rem; color: var(--accent-color); font-weight: bold; margin-bottom: 1rem;">
      ${car.harga ? formatRupiah(car.harga) : 'Hubungi Dealer'}
    </p>
    <div class="car-specs" style="grid-template-columns: repeat(2, 1fr); gap: 0.8rem; margin-bottom: 1.5rem;">
      <div><strong>Tahun Rilis:</strong> ${car.tahun || 'N/A'}</div>
      <div><strong>Transmisi:</strong> ${car.transmisi || 'N/A'}</div>
      <div><strong>Bahan Bakar:</strong> ${car.bahan_bakar || car.bbm || 'N/A'}</div>
      <div><strong>Status:</strong> ${car.status || 'Tersedia'}</div>
    </div>
    <button class="btn-detail" style="width: 100%; padding: 0.8rem;" onclick="alert('Terima kasih! Silakan hubungi tim sales Zahrah Amalia Auto Gallery.')">Hubungi Dealer</button>
  `;

  carModal.classList.add('active');
};

// Event Listeners
searchInput.addEventListener('input', filterAndSortCars);
brandFilter.addEventListener('change', filterAndSortCars);
sortFilter.addEventListener('change', filterAndSortCars);

closeModalBtn.addEventListener('click', () => {
  carModal.classList.remove('active');
});

carModal.addEventListener('click', (e) => {
  if (e.target === carModal) {
    carModal.classList.remove('active');
  }
});

// Jalankan Fetch ketika DOM selesai dimuat
document.addEventListener('DOMContentLoaded', fetchCarData);