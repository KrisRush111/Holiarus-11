const SERVER_URL = "https://server-for-holi-222.onrender.com";

async function getUserId() {
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const id = telegramUser?.id || localStorage.getItem("telegramUserId");
    if (id) {
        localStorage.setItem("telegramUserId", id);
        return id;
    }
    return null;
}

async function initUserOnServer() {
    const userId = await getUserId();
    const userName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || "Игрок";

    const response = await fetch(`${SERVER_URL}/get_user/${userId}`);
    const existingUser = await response.json();

    if (!existingUser || existingUser.name === "Гость") {
        const progress = {
            crystals: parseInt(localStorage.getItem("totalCrystals") || "0"),
            keys: parseInt(localStorage.getItem("totalKeys") || "0"),
            hlcoin: parseInt(localStorage.getItem("totalHLCoin") || "0"),
            purchasedSkins: JSON.parse(localStorage.getItem("purchasedSkins") || "[]"),
            selectedSkin: localStorage.getItem("selectedSkin") || "",
            completedTasks: JSON.parse(localStorage.getItem("completedTasks") || "[]"),
            lastGiftTime: parseInt(localStorage.getItem("lastGiftTime") || "0")
        };

        console.log("[INIT] Отправляем локальные данные как прогресс нового пользователя:", progress);

        await fetch(`${SERVER_URL}/init_user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userId, name: userName, progress })
        });
    } else {
        console.log("[INIT] Пользователь уже существует, инициализация пропущена");
    }
}

async function saveProgressToServer() {
    const userId = await getUserId();
    if (!userId) return;

    const progress = {
        crystals: parseInt(localStorage.getItem("totalCrystals")) || 0,
        keys: parseInt(localStorage.getItem("totalKeys")) || 0,
        hlcoin: parseInt(localStorage.getItem("totalHLCoin")) || 0,
        purchasedSkins: JSON.parse(localStorage.getItem("purchasedSkins") || "[]"),
        selectedSkin: localStorage.getItem("selectedSkin") || "",
        completedTasks: JSON.parse(localStorage.getItem("completedTasks") || "[]"),
        lastGiftTime: parseInt(localStorage.getItem("lastGiftTime") || "0")
    };

    await fetch(`${SERVER_URL}/save_progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, progress })
    });

    console.log("[SAVE] Прогресс сохранён на сервере:", progress);
}

async function loadProgressFromServer() {
    const userId = await getUserId();
    if (!userId) return;

    const res = await fetch(`${SERVER_URL}/get_progress/${userId}`);
    const progress = await res.json();

    console.log("[LOAD] Прогресс получен с сервера:", progress);

    localStorage.setItem("totalCrystals", progress.crystals || 0);
    localStorage.setItem("totalKeys", progress.keys || 0);
    localStorage.setItem("totalHLCoin", progress.hlcoin || 0);
    localStorage.setItem("purchasedSkins", JSON.stringify(progress.purchasedSkins || []));
    localStorage.setItem("selectedSkin", progress.selectedSkin || "");
    localStorage.setItem("completedTasks", JSON.stringify(progress.completedTasks || []));
    localStorage.setItem("lastGiftTime", progress.lastGiftTime || 0);
}
