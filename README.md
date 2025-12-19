# Hava Durumu

Modern, sade ve hızlı bir hava durumu uygulaması.
Vanilla JavaScript kullanılarak geliştirilmiştir ve OpenWeather API üzerinden veri alır.

## 🇹🇷 Türkçe

### 📌 Uygulama Hakkında

Bu uygulama:

* Anlık hava durumunu gösterir
* 7 günlük hava tahmini sunar
* Dil desteği içerir (TR / EN)
* Koyu / Açık tema desteği vardır
* Sayfa ilk açıldığında şehir slider’ı gösterir

Herhangi bir framework kullanılmadan, tamamen **HTML, CSS ve JavaScript** ile geliştirilmiştir.

### 🚀 Özellikler

* 🌍 Şehir bazlı hava durumu sorgulama
* 📅 7 günlük hava tahmini
* 🌗 Koyu / Açık tema
* 🌐 Türkçe / İngilizce dil desteği
* 🧼 Sade ve performanslı yapı

### 🔑 OpenWeather API Key Alma

Uygulama çalışmak için **OpenWeather API key** gerektirir.

#### 1️⃣ API Key Al

1. [https://openweathermap.org](https://openweathermap.org) adresine git
2. Ücretsiz bir hesap oluştur
3. Giriş yaptıktan sonra **API Keys** bölümüne gir
4. Oluşturulan API key’i kopyala

### 🛠 API Key’i Projeye Ekleme

1. Proje içindeki **`script.js`** dosyasını aç
2. En üstte şu satırı bul:

```js
const API_KEY = "";
```

3. Boş tırnakların içine kendi API key’ini yapıştır:

```js
const API_KEY = "BURAYA_API_KEYINI_YAPISTIR";
```

4. Dosyayı kaydet ve uygulamayı tarayıcıda aç

⚠️ **Güvenlik Notu:**
API key bilinçli olarak GitHub reposuna eklenmemiştir.
Lütfen kendi API key’inizi public repolara eklemeyin.


## 🇬🇧 English

### 📌 About the Application

This is a modern, clean, and fast weather application.

It:

* Displays current weather information
* Shows a 7-day weather forecast
* Supports multiple languages (TR / EN)
* Includes Dark / Light theme support
* Shows a city slider on initial load

The project is built using **pure HTML, CSS, and JavaScript**, without any frameworks.

### 🚀 Features

* 🌍 City-based weather search
* 📅 7-day forecast
* 🌗 Dark / Light theme
* 🌐 English / Turkish language support
* 🧼 Clean and performant structure

### 🔑 Getting an OpenWeather API Key

This application requires an **OpenWeather API key** to work.

#### 1️⃣ Get an API Key

1. Go to [https://openweathermap.org](https://openweathermap.org)
2. Create a free account
3. Navigate to the **API Keys** section
4. Copy your generated API key

### 🛠 Adding the API Key to the Project

1. Open the **`script.js`** file
2. Find the following line at the top:

```js
const API_KEY = "";
```

3. Paste your API key inside the quotes:

```js
const API_KEY = "PASTE_YOUR_API_KEY_HERE";
```

4. Save the file and open the project in your browser

⚠️ **Security Note:**
The API key is intentionally not included in this repository.
Do not commit your personal API key to public repositories.

---

### 🧑‍💻 Technologies Used

* HTML5
* CSS3
* Vanilla JavaScript
* OpenWeather API
