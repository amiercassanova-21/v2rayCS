# Jalur integrasi VPN native

v2rayCS saat ini adalah aplikasi Expo/React Native dengan adapter demonstrasi. Jangan mempromosikan simulasi sebagai koneksi VPN aktif. Sebelum merilis klien nyata, implementasi native perlu dirancang, ditinjau, dan diuji terpisah.

Tahapan teknis untuk pekerjaan lanjutan:

1. Pilih runtime yang benar-benar mendukung setiap protokol dan versi konfigurasi yang ditargetkan; verifikasi Hysteria2 secara terpisah dari Xray-core.
2. Buat native module/Expo config plugin dan Android `VpnService`, termasuk alur persetujuan VPN OS, mulai/berhenti layanan, lifecycle, notifikasi, dan penanganan crash.
3. Tentukan sumber, lisensi, dan proses build binary runtime untuk ABI Android yang didukung. Jangan mengunduh binary secara dinamis tanpa pemeriksaan integritas dan provenance.
4. Tambahkan adapter runtime dengan pemetaan model profil yang tervalidasi. Jangan meneruskan konfigurasi pengguna langsung ke proses tanpa validasi, pembatasan, dan redaksi log.
5. Jalankan `expo prebuild`/development build yang sesuai; Expo Go sendiri tidak dapat memuat modul VPN native khusus.
6. Uji perangkat nyata: permintaan izin, koneksi dan pemutusan, jaringan berpindah, restart layanan, IPv4/IPv6, DNS, kebocoran, konsumsi baterai, kegagalan autentikasi, dan pemulihan.
7. Audit privasi, keamanan, dependency, dan lisensi sebelum menyimpan atau mengirim profil pengguna.

Setelah adapter native benar-benar diterapkan, ubah `ConnectionAdapter` di `features/connection/adapter.ts`, sediakan build native yang dapat direproduksi, tambahkan tes dan bukti pengujian perangkat, dan hapus label simulasi hanya untuk jalur koneksi yang benar-benar terverifikasi.
