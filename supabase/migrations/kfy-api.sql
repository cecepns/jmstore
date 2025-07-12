-- Add package_api_id field to packages table

-- Insert XL package data into packages table
-- Mapping: package_id -> package_api_id, nama -> name, harga -> price, deskripsi -> description
-- Pricing: price_user = price + 3000, price_seller = price + 2000, price_reseller = price + 1000

INSERT INTO packages (package_api_id, name, description, price, type, provider, denomination, category, price_user, price_seller, price_reseller) VALUES
('XLMINISUPERV2', 'Akrab Anggota(Super Mini PROMO)', 'Details Kuota :
AREA 1 = 13 - 15 GB
AREA 2 = 15 - 17 GB
AREA 3 = 20 - 22 GB
AREA 4 = 30 - 32 GB

noted :
~ rewards tidak masuk, tunngu 1 x 24 jam, baru komplen
~ official, resmi, bergaransi
~ bisa reinvit dengan paket, reinvit tanpa lewat admin', 37000.00, 'kuota', 'xl', 'XLMINISUPERV2', 'api', 40000.00, 39000.00, 38000.00),

('XLBIG', 'Akrab Anggota(BIG)', '- benefits kuota yang di dapatkan
 ~ Kuota Bersama 
 ~ Kuota Nasional
 ~ Kuota Lokal
 ~ Bonus myRewards

- kuota yang di dapat sesuai Area
 ~ AREA 1 : 38 GB - 40 GB
 ~ AREA 2 : 40 GB - 42 GB
 ~ AREA 3 : 45 GB - 47 GB
 ~ AREA 4 : 55 GB - 57 GB

noted :
~ rewards tidak masuk, tunngu 1 x 24 jam, baru komplen
~ official 100%, resmi, bergaransi
~ bisa reinvit dengan paket, reinvit tanpa lewat admin', 52500.00, 'kuota', 'xl', 'XLBIG', 'api', 55500.00, 54500.00, 53500.00),

('XLBIGPLUS', 'Akrab Anggota(BIG PLUS)', '- benefits kuota yang di dapatkan
 ~ Kuota Bersama 
 ~ Kuota Nasional
 ~ Kuota Lokal
 ~ Kuota myRewards

- kuota yang di dapat sesuai Area
 ~ AREA 1 : 35 GB
 ~ AREA 2 : 38 GB
 ~ AREA 3 : 49 GB
 ~ AREA 4 : 73 GB


noted :
~ rewards tidak masuk, tunngu 1 x 24 jam, baru komplen
~ official, resmi, bergaransi
~ bisa reinvit dengan paket, reinvit tanpa lewat admin', 58000.00, 'kuota', 'xl', 'XLBIGPLUS', 'api', 61000.00, 60000.00, 59000.00),

('XLMINI', 'Akrab Anggota(MINI)', '- benefits kuota yang di dapatkan
 ~ Kuota Bersama 
 ~ Kuota Nasional
 ~ Kuota Lokal
 ~ Kuota myRewards

- kuota yang di dapat sesuai Area
 ~ AREA 1 : 31.75 GB - 33.75 GB
 ~ AREA 2 : 33.75 - 35.75 GB
 ~ AREA 3 : 38.75 - 40.75 GB
 ~ AREA 4 : 48.75 - 50.75 GB


noted :
~ rewards tidak masuk, tunngu 1 x 24 jam, baru komplen
~ official, resmi, bergaransi
~ bisa reinvit dengan paket, reinvit tanpa lewat admin', 47500.00, 'kuota', 'xl', 'XLMINI', 'api', 50500.00, 49500.00, 48500.00),

('XLJUMBO', 'Akrab Anggota XXL Rewards (JUMBO)', '- benefits kuota yang di dapatkan
 ~ Kuota Bersama 
 ~ Kuota Nasional
 ~ Kuota Lokal
 ~ Bonus myRewards

- kuota yang di dapat sesuai Area
 ~ Area 1 = 65 GB
 ~ Area 2 = 70 GB
 ~ Area 3 = 83 GB
 ~ Area 4 = 123 GB

noted :
~ rewards tidak masuk, tunngu 1 x 24 jam, baru komplen
~ official, resmi, bergaransi
~ bisa reinvit dengan paket, reinvit tanpa lewat admin', 74000.00, 'kuota', 'xl', 'XLJUMBO', 'api', 77000.00, 76000.00, 75000.00),

('XLJUMBOV2', 'Akrab Anggota Rewards (JUMBO v2)', '- benefits kuota yang di dapatkan
 ~ Kuota Bersama 
 ~ Kuota Nasional
 ~ Kuota Lokal
 ~ Kuota myRewards

Details Kuota :
AREA 1 = 50.5 - 52.5 GB
AREA 2 = 52.5 - 54.5 GB
AREA 3 = 57.5 - 59.5 GB
AREA 4 = 67.5 - 69.5 GB



noted :
~ rewards tidak masuk, tunngu 1 x 24 jam, baru komplen
~ official, resmi, bergaransi
~ bisa reinvit dengan paket, reinvit tanpa lewat admin', 63000.00, 'kuota', 'xl', 'XLJUMBOV2', 'api', 66000.00, 65000.00, 64000.00),

('XLBIGMEGA', 'AkrabAnggota(Mega Big)', '- benefits kuota yang di dapatkan
 ~ Kuota Bersama 
 ~ Kuota Nasional
 ~ Kuota Lokal
 ~ Bonus myRewards

- kuota yang di dapat sesuai Area
 ~ AREA 1 : 88 GB - 90 GB
 ~ AREA 2 : 90 GB - 92 GB
 ~ AREA 3 : 95 GB - 97 GB
 ~ AREA 4 : 105 GB - 107 GB

noted :
~ rewards tidak masuk, tunngu 1 x 24 jam, baru komplen
~ official 100%, resmi, bergaransi
~ bisa reinvit dengan paket, reinvit tanpa lewat admin', 85000.00, 'kuota', 'xl', 'XLBIGMEGA', 'api', 88000.00, 87000.00, 86000.00),

('TESAKRAB', 'AKrab XXL Orderan Fake', 'catatan :
 ~ orderan fiktig.. untuk keperluan resApi', 0.00, 'kuota', 'xl', 'TESAKRAB', 'api', 3000.00, 2000.00, 1000.00),

('REINVIT', 'REINVIT BOSSSSSS', 'catatan :
 ~ Apabila paket anda Big,Mini,Jumbo terkena tendang oleh pengelola, anda bisa melakukan reinvit di sini
 ', 0.00, 'kuota', 'xl', 'REINVIT', 'api', 3000.00, 2000.00, 1000.00),

('XLBEKASAN3', 'Akrab Anggota L(3 hari)', 'AREA 1 = 8 GB
AREA 2 = 10 GB
AREA 3 = 15 GB
AREA 4 = 25 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 3 hari (kalo hoki, bisa dapet yang 4 hari)
', 3000.00, 'kuota', 'xl', 'XLBEKASAN3', 'api', 6000.00, 5000.00, 4000.00),

('XLBEKASAN5', 'Akrab Anggota L(5 hari)', 'AREA 1 = 8 GB
AREA 2 = 10 GB
AREA 3 = 15 GB
AREA 4 = 25 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 5 hari (kalo hoki, bisa dapet yang 6 hari)
', 4000.00, 'kuota', 'xl', 'XLBEKASAN5', 'api', 7000.00, 6000.00, 5000.00),

('XLBEKASAN7', 'Akrab Anggota L(7 hari)', 'AREA 1 = 8 GB
AREA 2 = 10 GB
AREA 3 = 15 GB
AREA 4 = 25 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 7 hari (kalo hoki, bisa dapet yang 8 hari)
', 6000.00, 'kuota', 'xl', 'XLBEKASAN7', 'api', 9000.00, 8000.00, 7000.00),

('XLBEKASAN9', 'Akrab Anggota L(9 hari)', 'AREA 1 = 8 GB
AREA 2 = 10 GB
AREA 3 = 15 GB
AREA 4 = 25 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 9 hari (kalo hoki, bisa dapet yang 10 hari)
', 8000.00, 'kuota', 'xl', 'XLBEKASAN9', 'api', 11000.00, 10000.00, 9000.00),

('XLBEKASAN11', 'Akrab Anggota L(11 hari)', 'AREA 1 = 8 GB
AREA 2 = 10 GB
AREA 3 = 15 GB
AREA 4 = 25 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 11 hari (kalo hoki, bisa dapet yang 12 hari)
', 10000.00, 'kuota', 'xl', 'XLBEKASAN11', 'api', 13000.00, 12000.00, 11000.00),

('XLBEKASAN13', 'Akrab Anggota L(13 hari)', 'AREA 1 = 8 GB
AREA 2 = 10 GB
AREA 3 = 15 GB
AREA 4 = 25 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 13 hari (kalo hoki, bisa dapet yang 14 hari)
', 12000.00, 'kuota', 'xl', 'XLBEKASAN13', 'api', 15000.00, 14000.00, 13000.00),

('XLBEKASAN15', 'Akrab Anggota L(15 hari)', 'AREA 1 = 8 GB
AREA 2 = 10 GB
AREA 3 = 15 GB
AREA 4 = 25 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 15 hari (kalo hoki, bisa dapet yang 16 hari)
', 14000.00, 'kuota', 'xl', 'XLBEKASAN15', 'api', 17000.00, 16000.00, 15000.00),

('XLBEKASAN17', 'Akrab Anggota L(17 hari)', 'AREA 1 = 8 GB
AREA 2 = 10 GB
AREA 3 = 15 GB
AREA 4 = 25 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 17 hari (kalo hoki, bisa dapet yang 18 hari)
', 16000.00, 'kuota', 'xl', 'XLBEKASAN17', 'api', 19000.00, 18000.00, 17000.00),

('XLBEKASAN19', 'Akrab Anggota L(19 hari)', 'AREA 1 = 8 GB
AREA 2 = 10 GB
AREA 3 = 15 GB
AREA 4 = 25 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 19 hari (kalo hoki, bisa dapet yang 20 hari)
', 18000.00, 'kuota', 'xl', 'XLBEKASAN19', 'api', 21000.00, 20000.00, 19000.00),

('XLBEKASANORI3', 'Akrab Anggota XL(3 hari)', '', 3000.00, 'kuota', 'xl', 'XLBEKASANORI3', 'api', 6000.00, 5000.00, 4000.00),

('XLBEKASANORI5', 'Akrab Anggota XL(5 hari)', '', 5000.00, 'kuota', 'xl', 'XLBEKASANORI5', 'api', 8000.00, 7000.00, 6000.00),

('XLBEKASANORI7', 'Akrab Anggota XL(7 hari)', 'AREA 1 = 1.5 GB
AREA 2 = 4.5 GB
AREA 3 = 15 GB
AREA 4 = 39 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 7 hari (kalo hoki, bisa dapet yang 8 hari)
', 7000.00, 'kuota', 'xl', 'XLBEKASANORI7', 'api', 10000.00, 9000.00, 8000.00),

('XLBEKASANORI9', 'Akrab Anggota XL(9 hari)', 'AREA 1 = 1.5 GB
AREA 2 = 4.5 GB
AREA 3 = 15 GB
AREA 4 = 39 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 9 hari (kalo hoki, bisa dapet yang 10 hari)
', 9000.00, 'kuota', 'xl', 'XLBEKASANORI9', 'api', 12000.00, 11000.00, 10000.00),

('XLBEKASANORI11', 'Akrab Anggota XL(11 hari)', 'AREA 1 = 1.5 GB
AREA 2 = 4.5 GB
AREA 3 = 15 GB
AREA 4 = 39 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 11 hari (kalo hoki, bisa dapet yang 12 hari)
', 11000.00, 'kuota', 'xl', 'XLBEKASANORI11', 'api', 14000.00, 13000.00, 12000.00),

('XLBEKASANORI13', 'Akrab Anggota XL(13 hari)', 'AREA 1 = 1.5 GB
AREA 2 = 4.5 GB
AREA 3 = 15 GB
AREA 4 = 39 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 13 hari (kalo hoki, bisa dapet yang 14 hari)
', 13000.00, 'kuota', 'xl', 'XLBEKASANORI13', 'api', 16000.00, 15000.00, 14000.00),

('XLBEKASANORI15', 'Akrab Anggota XL(15 hari)', 'AREA 1 = 1.5 GB
AREA 2 = 4.5 GB
AREA 3 = 15 GB
AREA 4 = 39 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 15 hari (kalo hoki, bisa dapet yang 16 hari)
', 15000.00, 'kuota', 'xl', 'XLBEKASANORI15', 'api', 18000.00, 17000.00, 16000.00),

('XLBEKASANORI17', 'Akrab Anggota XL(17 hari)', 'AREA 1 = 1.5 GB
AREA 2 = 4.5 GB
AREA 3 = 15 GB
AREA 4 = 39 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 17 hari (kalo hoki, bisa dapet yang 18 hari)
', 17000.00, 'kuota', 'xl', 'XLBEKASANORI17', 'api', 20000.00, 19000.00, 18000.00),

('XLBEKASANORI19', 'Akrab Anggota XL(19 hari)', 'AREA 1 = 1.5 GB
AREA 2 = 4.5 GB
AREA 3 = 15 GB
AREA 4 = 39 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 19 hari (kalo hoki, bisa dapet yang 20 hari)
', 19000.00, 'kuota', 'xl', 'XLBEKASANORI19', 'api', 22000.00, 21000.00, 20000.00),

('XXLBEKASAN3', 'Akrab Anggota XXL(3 hari)', 'AREA 1 = 7.5 GB
AREA 2 = 12 GB
AREA 3 = 25 GB
AREA 4 = 65 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 3 hari (kalo hoki, bisa dapet yang 4 hari)', 5000.00, 'kuota', 'xl', 'XXLBEKASAN3', 'api', 8000.00, 7000.00, 6000.00),

('XXLBEKASAN5', 'Akrab Anggota XXL(5 hari)', 'AREA 1 = 7.5 GB
AREA 2 = 12 GB
AREA 3 = 25 GB
AREA 4 = 65 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 5 hari (kalo hoki, bisa dapet yang 6 hari)', 7000.00, 'kuota', 'xl', 'XXLBEKASAN5', 'api', 10000.00, 9000.00, 8000.00),

('XXLBEKASAN7', 'Akrab Anggota XXL(7 hari)', 'AREA 1 = 7.5 GB
AREA 2 = 12 GB
AREA 3 = 25 GB
AREA 4 = 65 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 7 hari (kalo hoki, bisa dapet yang 8 hari)', 10000.00, 'kuota', 'xl', 'XXLBEKASAN7', 'api', 13000.00, 12000.00, 11000.00),

('XXLBEKASAN9', 'Akrab Anggota XXL(9 hari)', 'AREA 1 = 7.5 GB
AREA 2 = 12 GB
AREA 3 = 25 GB
AREA 4 = 65 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 9 hari (kalo hoki, bisa dapet yang 10 hari)', 12000.00, 'kuota', 'xl', 'XXLBEKASAN9', 'api', 15000.00, 14000.00, 13000.00),

('XXLBEKASAN11', 'Akrab Anggota XXL(11 hari)', 'AREA 1 = 7.5 GB
AREA 2 = 12 GB
AREA 3 = 25 GB
AREA 4 = 65 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 11 hari (kalo hoki, bisa dapet yang 12 hari)', 14000.00, 'kuota', 'xl', 'XXLBEKASAN11', 'api', 17000.00, 16000.00, 15000.00),

('XXLBEKASAN13', 'Akrab Anggota XXL(13 hari)', 'AREA 1 = 7.5 GB
AREA 2 = 12 GB
AREA 3 = 25 GB
AREA 4 = 65 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 13 hari (kalo hoki, bisa dapet yang 14 hari)', 16000.00, 'kuota', 'xl', 'XXLBEKASAN13', 'api', 19000.00, 18000.00, 17000.00),

('XXLBEKASAN15', 'Akrab Anggota XXL(15 hari)', 'AREA 1 = 7.5 GB
AREA 2 = 12 GB
AREA 3 = 25 GB
AREA 4 = 65 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 15 hari (kalo hoki, bisa dapet yang 16 hari)', 18000.00, 'kuota', 'xl', 'XXLBEKASAN15', 'api', 21000.00, 20000.00, 19000.00),

('XXLBEKASAN17', 'Akrab Anggota XXL(17 hari)', 'AREA 1 = 7.5 GB
AREA 2 = 12 GB
AREA 3 = 25 GB
AREA 4 = 65 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 17 hari (kalo hoki, bisa dapet yang 18 hari)', 20000.00, 'kuota', 'xl', 'XXLBEKASAN17', 'api', 23000.00, 22000.00, 21000.00),

('XXLBEKASAN19', 'Akrab Anggota XXL(19 hari)', 'AREA 1 = 7.5 GB
AREA 2 = 12 GB
AREA 3 = 25 GB
AREA 4 = 65 GB

noted :
~ official, resmi, bergaransi
~ masa aktif paket 19 hari (kalo hoki, bisa dapet yang 20 hari)', 21000.00, 'kuota', 'xl', 'XXLBEKASAN19', 'api', 24000.00, 23000.00, 22000.00);
