# v2rayCS

Aplikasi mobile berbasis Expo/React Native untuk mengelola profil jaringan dengan antarmuka yang terinspirasi cakupan fitur Xelvra. Proyek saat ini menyediakan UI, penyimpanan profil lokal, formulir protokol, log aplikasi, dan status koneksi demonstrasi.

> **Status penting:** tombol koneksi, durasi, trafik, dan log koneksi saat ini adalah simulasi UI. Aplikasi ini belum membuat Android VPN tunnel, belum menjalankan Xray-core, dan belum menyertakan runtime Hysteria2 native.

## Fitur yang tersedia

- Tab Beranda, Profil, Log, Pengaturan, dan Admin.
- Buat, lihat, edit, pilih, dan hapus profil VMess, VLESS, Trojan, Shadowsocks, dan Hysteria2. Form Hysteria2 menyediakan auth, SNI, Salamander obfuscation, serta batas upload/download.
- Impor URI untuk VMess, VLESS, Trojan, Shadowsocks, dan Hysteria2/Hy2, dengan validasi nama/server/port/kredensial sesuai jenis protokol.
- Log aktivitas dengan waktu, filter info/peringatan/error, dan penghapusan lokal. Sumber setiap catatan ditandai sebagai aplikasi/simulasi.
- Akses panel admin menggunakan pemeriksaan role `admin` server-side. Pemilik proyek dapat memiliki role admin berdasarkan aturan starter.
- Admin dapat mengubah nama tampilan dalam aplikasi dan menambahkan/menghapus definisi metadata protokol. Perubahan lokal hanya tersimpan pada perangkat tersebut. Nama launcher native tetap memerlukan pembaruan konfigurasi dan build ulang.
- Adapter koneksi terpisah dari UI; adapter yang terpasang saat ini hanya menunda transisi status dan tidak mengirim trafik.

## Menjalankan proyek

Starter menyediakan Node.js/TypeScript, Expo Router, React Native, server Express/tRPC, dan database MySQL terkelola.

```sh
pnpm install
pnpm db:push
pnpm dev
```

`pnpm dev` menjalankan API pada port 3000 dan Metro/Web Preview pada port 8081. Port tersebut dikunci oleh starter Mobile WebDev. Perangkat Expo Go dapat melihat antarmuka, tetapi tidak mengaktifkan VPN native.

Periksa kode dengan:

```sh
pnpm check
pnpm lint
pnpm test
```

## Akses Admin

Backend mengizinkan akses melalui `adminProcedure`; role tidak dapat diberikan dari panel aplikasi. Pengguna perlu masuk menggunakan akun Manus. Pada starter ini pemilik proyek ditetapkan admin oleh aturan `upsertUser` jika identitasnya cocok dengan pemilik proyek. Akun lain harus memperoleh role admin melalui mekanisme pengelolaan server yang aman.

Nama tampilan dan registri protokol tambahan disimpan pada AsyncStorage perangkat. Profil juga disimpan lokal pada perangkat. Berkas lokal dapat berisi password/token profil; lindungi perangkat dan jangan membagikan file ekspor atau tautan URI yang membawa kredensial. Log aplikasi tidak menulis isi kredensial.

## Hysteria2 dan batas koneksi

Aplikasi menyimpan field Hysteria2 dan membaca URI `hysteria2://`/`hy2://`. Ini hanya pengelolaan konfigurasi. Agar menjadi klien tunnel sungguhan, proyek memerlukan adapter native dengan implementasi runtime yang kompatibel, integrasi Android `VpnService`, konfigurasi Gradle/Expo prebuild dan development build, izin sistem yang sesuai, binary untuk ABI target, serta pengujian pada perangkat Android nyata. Integrasi Xray-core saja tidak boleh diasumsikan menyediakan Hysteria2. Definisi protokol kustom yang dibuat admin juga belum menghasilkan dukungan runtime.

Perubahan nama yang dilakukan pada layar admin hanya mengubah teks di dalam UI. Nama aplikasi yang ditampilkan launcher/OS berasal dari konfigurasi native `app.config.ts` dan membutuhkan build binary baru.

## GitHub dan penyimpanan proyek

Proyek Mobile WebDev ini saat ini memakai repositori kanonis yang dikelola Manus. Jalur pemindahan repositori kanonis ke GitHub tidak tersedia untuk Mobile Dev, sehingga README ini **tidak** menyatakan kode telah diunggah ke GitHub. File sumber proyek dan dokumentasi tetap tersedia dalam workspace WebDev.

## Referensi dan lisensi

Repositori [MasFha/Xelvra](https://github.com/MasFha/Xelvra) digunakan sebagai referensi cakupan fitur dan struktur layar. v2rayCS tidak menyalin kode sumber, binary, atau tangkapan layar dari repositori tersebut. Jika kode atau aset diambil pada pekerjaan lanjutan, periksa file lisensi dan atribusi dependency/aset sebelum didistribusikan. Proyek ini tidak berafiliasi atau didukung oleh Xelvra, Xray, maupun penyedia protokol.
