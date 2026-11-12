/* =========================================================
   Aksara Peduli Argantara — interaksi
   ========================================================= */

// Nomor WhatsApp tujuan pesanan, format internasional TANPA tanda + atau spasi.
// Contoh: '6281234567890'. Selama masih kosong, tombol kirim hanya menampilkan pemberitahuan.
const NOMOR_WA = '';

const geraknyaDikurangi = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Menu navigasi (layar kecil) ---------- */
const navTombol = document.getElementById('navTombol');
const navMenu = document.getElementById('navMenu');

function aturMenu(buka) {
  navMenu.classList.toggle('buka', buka);
  navTombol.setAttribute('aria-expanded', String(buka));
  navTombol.querySelector('.sr').textContent = buka ? 'Tutup menu' : 'Buka menu';
}
navTombol.addEventListener('click', () => aturMenu(!navMenu.classList.contains('buka')));
navMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => aturMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu.classList.contains('buka')) {
    aturMenu(false);
    navTombol.focus();
  }
});

/* ---------- Tandai menu sesuai bagian yang sedang dibaca ---------- */
const tautanMenu = navMenu.querySelectorAll('a:not(.tombol)');
const pengamatBagian = new IntersectionObserver(
  (entri) => {
    entri.forEach((e) => {
      if (!e.isIntersecting) return;
      tautanMenu.forEach((a) => {
        const cocok = a.getAttribute('href') === `#${e.target.id}`;
        a.classList.toggle('aktif', cocok);
        if (cocok) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-45% 0px -50% 0px' }
);
['tentang', 'produk', 'mitra'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) pengamatBagian.observe(el);
});

/* ---------- Grafik komposisi SAMBARA ---------- */
const grafik = document.getElementById('grafik');
if (geraknyaDikurangi || !('IntersectionObserver' in window)) {
  grafik.classList.add('tampil');
} else {
  new IntersectionObserver(
    (entri, pengamat) => {
      if (entri[0].isIntersecting) {
        grafik.classList.add('tampil');
        pengamat.disconnect();
      }
    },
    { threshold: 0.35 }
  ).observe(grafik);
}

/* ---------- TELARA: tetes jeruk nipis ---------- */
const es = document.getElementById('esTelara');
const tombolJeruk = document.getElementById('tombolJeruk');
const esKet = document.getElementById('esKet');
const esJudul = document.getElementById('esJudul');

tombolJeruk.addEventListener('click', () => {
  const jadiUngu = !es.classList.contains('ungu');

  if (jadiUngu && !geraknyaDikurangi) {
    es.classList.remove('netes');
    void es.getBoundingClientRect(); // ulang animasi tetesan
    es.classList.add('netes');
  }
  es.classList.toggle('ungu', jadiUngu);

  tombolJeruk.setAttribute('aria-pressed', String(jadiUngu));
  tombolJeruk.textContent = jadiUngu ? 'Kembalikan ke biru' : 'Teteskan jeruk nipis';
  esJudul.textContent = jadiUngu ? 'Ilustrasi es krim TELARA berwarna ungu' : 'Ilustrasi es krim TELARA berwarna biru';
  esKet.textContent = jadiUngu
    ? 'Warnanya berubah menjadi ungu karena antosianin pada bunga telang bereaksi dengan asam jeruk nipis.'
    : 'Bunga telang mengandung pigmen antosianin yang berubah warna saat terkena asam.';
});

/* ---------- Formulir pemesanan ---------- */
const form = document.getElementById('formPesan');
const pratinjau = document.getElementById('pratinjauPesan');
const galat = document.getElementById('formGalat');
const statusSalin = document.getElementById('statusSalin');

function angka(nilai) {
  const n = parseInt(nilai, 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 99) : 0;
}

function susunPesan() {
  const d = form.elements;
  const nama = d.nama.value.trim();
  const alamat = d.alamat.value.trim();
  const sambara = angka(d.sambara.value);
  const telara = angka(d.telara.value);
  const catatan = d.catatan.value.trim();

  const baris = ['Halo Tim Aksara Peduli Argantara, saya ingin memesan:'];
  if (sambara) baris.push(`- SAMBARA (Sambal Bandeng Aksara, 150 g): ${sambara} pcs`);
  if (telara) baris.push(`- TELARA (Telang Aksara): ${telara} pcs`);
  if (!sambara && !telara) baris.push('- (belum ada produk dipilih)');
  baris.push('');
  baris.push(`Nama: ${nama || '-'}`);
  baris.push(`Alamat/kota: ${alamat || '-'}`);
  if (catatan) baris.push(`Catatan: ${catatan}`);
  baris.push('');
  baris.push('Terima kasih.');
  return baris.join('\n');
}

function perbaruiPratinjau() {
  pratinjau.value = susunPesan();
  statusSalin.textContent = '';
}

function periksa() {
  const d = form.elements;
  const kosong = [];
  [d.nama, d.alamat].forEach((el) => {
    const salah = !el.value.trim();
    el.setAttribute('aria-invalid', String(salah));
    if (salah) kosong.push(el);
  });
  const adaProduk = angka(d.sambara.value) + angka(d.telara.value) > 0;

  if (kosong.length) {
    galat.textContent = 'Nama dan alamat wajib diisi.';
    kosong[0].focus();
    return false;
  }
  if (!adaProduk) {
    galat.textContent = 'Isi jumlah minimal satu produk.';
    d.sambara.focus();
    return false;
  }
  galat.textContent = '';
  return true;
}

form.addEventListener('input', perbaruiPratinjau);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!periksa()) return;

  const nomor = NOMOR_WA.replace(/\D/g, '');
  if (!nomor) {
    galat.textContent = 'Nomor WhatsApp tim belum diatur. Untuk sementara, salin pesan lalu kirim secara manual.';
    return;
  }
  window.open(`https://wa.me/${nomor}?text=${encodeURIComponent(susunPesan())}`, '_blank', 'noopener');
});

document.getElementById('tombolSalin').addEventListener('click', async () => {
  const teks = susunPesan();
  try {
    await navigator.clipboard.writeText(teks);
  } catch {
    // Cadangan untuk peramban lama / halaman tanpa HTTPS
    pratinjau.focus();
    pratinjau.select();
    document.execCommand('copy');
  }
  statusSalin.textContent = 'Pesan sudah disalin.';
});

perbaruiPratinjau();
