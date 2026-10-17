# Rencana implementasi v2rayCS

## Tujuan dan batas teknis

v2rayCS adalah aplikasi mobile Expo/React Native yang mengambil cakupan layar dari Xelvra: beranda/status koneksi, profil, log, serta pengaturan. Aplikasi mengelola konfigurasi VMess, VLESS, Trojan, Shadowsocks, dan Hysteria2. Tombol koneksi dan statistik pada starter ini adalah simulasi UI; proyek belum membawa Android `VpnService`, Xray-core, atau runtime Hysteria2 native. Tidak boleh menampilkan simulasi sebagai tunnel yang benar-benar tersambung.

Peran admin diperiksa melalui backend tRPC dan role pengguna yang sudah disediakan starter (`users.role` serta `adminProcedure`). Pemilik proyek dapat menjadi admin melalui aturan starter. Editor nama tampilan dan daftar protokol kustom disimpan lokal di perangkat untuk prototipe ini. Perubahan label ikon/launcher Android/iOS memerlukan perubahan konfigurasi native dan rebuild. Pembuatan atau pengaktifan protokol tambahan di UI bukan bukti adapter runtime tersedia.

## Pendekatan implementasi

Gunakan Expo Router/React Native/TypeScript starter dan layout portrait satu tangan. Tab utama berisi Beranda, Profil, Log, Pengaturan, dan Admin. Komponen dipisah dari model/protokol dan adapter koneksi; adapter saat ini hanya simulasi dengan status terkontrol, timer sesi, statistik demonstrasi, dan log bertanda `simulasi`.

Profil disimpan lokal pada perangkat, dapat dibuat, dilihat, diedit, dipilih, dihapus, dan diimpor dari URI yang dikenali. Form menampilkan field spesifik protokol termasuk parameter Hysteria2 (server, port, autentikasi, SNI, obfs Salamander, dan bandwidth) serta melakukan validasi. Informasi kredensial pada profil adalah data sensitif: jelaskan penyimpanan lokal dan jangan memasukkan konfigurasi pengguna ke log atau contoh dokumentasi.

Admin dilindungi dengan pemeriksaan `adminProcedure` di server, bukan flag klien. Endpoint admin hanya memvalidasi akses; fungsi editor di antarmuka dibatasi ke pengguna yang lolos pemeriksaan tersebut. Pengubahan nama tampilan dan registri protokol tambahan disimpan di AsyncStorage untuk prototipe lokal perangkat, bukan sebagai konfigurasi global/sinkron antarperangkat. Protokol tambahan memerlukan adapter native sebelum dapat menghubungkan tunnel.

Dokumentasikan batas native secara eksplisit beserta jalur kerja lanjutan: implementasi native module/Expo prebuild dan development build, integrasi Android `VpnService`, runtime Xray dan adapter Hysteria2 yang kompatibel, izin Android, bundling binary/ABI, kemudian uji pada perangkat Android nyata. Tinjau lisensi dan atribusi Xelvra sebelum menyalin kode atau aset; implementasi ini membuat UI/aset sendiri dan tidak menyalin kode sumber maupun tangkapan layar.

## Struktur proyek

- `app/(tabs)/_layout.tsx`: navigasi tab dan ikon tab.
- `app/(tabs)/index.tsx`: dasbor, profil aktif, kontrol koneksi simulasi, durasi/statistik demonstrasi.
- `app/(tabs)/profiles.tsx`: daftar, pilih, buat, impor, edit, dan hapus profil.
- `app/(tabs)/logs.tsx`: daftar log, filter level, dan bersihkan log simulasi.
- `app/(tabs)/settings.tsx`: preferensi lokal dan informasi perubahan nama tampilan.
- `app/(tabs)/admin.tsx`: pemeriksaan akses admin dan editor nama tampilan/protokol tambahan.
- `components/v2raycs/`: komponen presentasi bersama untuk kartu, status, input, tombol, dan modal.
- `features/profiles/`: model profil, codec URI, validasi, dan penyimpanan lokal.
- `features/connection/`: antarmuka adapter dan implementasi simulasi.
- `features/settings/`: preferensi dan registri protokol lokal.
- `server/routers.ts`: query akses admin terbatas melalui `adminProcedure`.
- `assets/images/`: ikon aplikasi v2rayCS untuk Expo dan varian Android.
- `README.md`: setup, pengujian, batas fungsional, privasi, atribusi, dan langkah integrasi native.

## Desain

- **Design Movement:** utilitas jaringan Android yang ringkas, dengan bahasa visual teknis modern yang terinspirasi aplikasi referensi Xelvra tanpa menyalin asetnya.
- **Core Principles:** status langsung terbaca; interaksi singkat untuk satu tangan; kredensial tidak dipajang di daftar/log; simulasi dan fungsi native dibedakan dengan tegas.
- **Color Philosophy:** dasar biru arang pekat memberi kontras tenang untuk pemantauan; cyan elektrik menandai tindakan dan data jaringan; hijau hanya untuk status simulasi aktif, amber untuk peringatan, merah untuk galat.
- **Layout Paradigm:** dasbor berorientasi alur vertikal, dengan indikator koneksi dominan, diikuti kartu profil aktif dan ringkasan sesi; navigasi bawah menjaga fungsi inti dekat ibu jari.
- **Signature Elements:** cincin koneksi berlapis; garis tipis berwarna cyan pada kartu; label kecil `SIMULASI` yang selalu tampak pada status/log non-native.
- **Interaction Philosophy:** tindakan punya hasil visual langsung dan dapat dibatalkan; proses destruktif meminta konfirmasi modal lintas platform; input sensitif disamarkan.
- **Animation:** transisi pendek 160–220 ms; cincin status berdenyut pelan hanya saat simulasi connecting/connected; tanpa gerakan dekoratif saat idle.
- **Typography System:** system sans bawaan untuk label dan isi, dengan angka status/durasi tebal yang sedikit lebih renggang; hirarki dari judul 28 px, subjudul 16–18 px, metadata 12–13 px.
- **Brand Essence:** pengelola profil jaringan untuk pengguna Android yang mengutamakan kontrol manual dan kejelasan status; teliti, ringkas, transparan.
- **Brand Voice:** instruksi langsung dan informatif. Contoh: “Pilih profil untuk melihat detailnya.” dan “Mode simulasi — belum membuat tunnel VPN.”
- **Wordmark & Logo:** ikon geometris berupa dua jalur jaringan yang bertemu pada simpul `C`, tanpa teks kecil di dalam ikon launcher.
- **Signature Brand Color:** cyan elektrik `#35D7F2`.

## GitHub dan pengiriman

Sumber proyek disimpan pada repositori Manus-managed. Mobile Dev saat ini tidak mendukung perpindahan repositori kanonis ke GitHub; karena itu tidak mengklaim proyek sudah diunggah ke GitHub. Proyek disiapkan dengan README dan struktur sumber yang siap diekspor/dipindahkan apabila jalur yang didukung tersedia. Jangan memasukkan rahasia, profil pengguna, kunci penandatanganan, atau APK ke repositori.
