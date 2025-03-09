const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// キャンバスサイズの設定
canvas.width = 400;
canvas.height = 600;

// ゲーム状態
let score = 0;
let timeLeft = 30;
let gameObjects = [];
let isGameRunning = false;

// かごの設定を修正
const basket = {
  x: canvas.width / 2,
  y: canvas.height - canvas.height * 0.15, // 初期位置を画面下から15%上に
  width: 50,
  height: 30,
};

// オブジェクト生成の制御用変数を修正
let lastObjectTime = 0;
const minInterval = 500; // 最小生成間隔（0.5秒）
const maxInterval = 1500; // 最大生成間隔（1.5秒）
const totalSakuraToGenerate = 20; // 花びらの総数を20に
const totalBugsToGenerate = 10; // 虫の総数を10に
let sakuraGenerated = 0;
let bugsGenerated = 0;
let nextObjectInterval = 1000;

// タッチデバイス用の操作を改善
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault(); // スクロール防止
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault(); // スクロール防止
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    // タッチ位置の計算を修正
    const touchX = touch.clientX - rect.left;
    basket.x = touchX - basket.width / 2;

    // かごが画面外に出ないように制限
    basket.x = Math.max(0, Math.min(canvas.width - basket.width, basket.x));
  },
  { passive: false }
);

// タッチ操作中のスクロールを防止
document.body.addEventListener(
  "touchmove",
  (e) => {
    if (isGameRunning) {
      e.preventDefault();
    }
  },
  { passive: false }
);

// DOM要素の取得
const startPopup = document.getElementById("startPopup");
const endPopup = document.getElementById("endPopup");
const startButton = document.getElementById("startButton");
const retryButton = document.getElementById("retryButton");
const finalScore = document.getElementById("finalScore");
const maxScore = document.getElementById("maxScore");

// スタートボタンのイベントリスナー
startButton.addEventListener("click", () => {
  startPopup.style.display = "none";
  startGame();
});

// リトライボタンのイベントリスナー
retryButton.addEventListener("click", () => {
  endPopup.style.display = "none";
  startGame();
});

// ゲームを開始する関数を修正
function startGame() {
  isGameRunning = true;
  score = 0;
  gameObjects = [];
  lastObjectTime = 0;
  sakuraGenerated = 0;
  bugsGenerated = 0;
  nextObjectInterval =
    Math.random() * (maxInterval - minInterval) + minInterval;

  // メインゲームループ
  requestAnimationFrame(gameLoop);
}

// ゲームを終了する関数を修正
function endGame() {
  isGameRunning = false;
  const maxPossibleScore = totalSakuraToGenerate;

  finalScore.textContent = `あなたのスコア: ${score}点`;
  maxScore.textContent = `最高可能スコア: ${maxPossibleScore}点`;
  endPopup.style.display = "flex";
}

// 初期画面を表示（ゲーム開始時に必ず実行）
showStartScreen();

// 新しいオブジェクト（花びらまたは虫）を生成する関数
function createObject(isSakura) {
  if (!isGameRunning) return;

  const object = {
    x: Math.random() * (canvas.width - canvas.width * 0.1),
    y: 0,
    width: isSakura ? canvas.width * 0.08 : canvas.width * 0.1, // キャンバス幅の8%または10%
    height: canvas.height * 0.04, // キャンバス高さの4%
    speed: (2 + Math.random() * 2) * (canvas.height / 600), // 画面の高さに応じて速度を調整
    isSakura: isSakura,
    swayOffset: Math.random() * Math.PI * 2,
    originalX: 0,
  };
  object.originalX = object.x;
  gameObjects.push(object);
}

// 背景の描画関数を追加
function drawBackground() {
  // グラデーションで空を描画
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7);
  skyGradient.addColorStop(0, "#87CEEB"); // 明るい青空
  skyGradient.addColorStop(1, "#B0E2FF"); // より明るい青
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);

  // 芝生を描画
  const grassGradient = ctx.createLinearGradient(
    0,
    canvas.height * 0.7,
    0,
    canvas.height
  );
  grassGradient.addColorStop(0, "#90C26A"); // 明るい緑
  grassGradient.addColorStop(1, "#639A45"); // 少し濃い緑
  ctx.fillStyle = grassGradient;
  ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
}

// メインゲームループ
function gameLoop(timestamp) {
  if (!isGameRunning) return;

  // キャンバスをクリア
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景を描画
  drawBackground();

  // かごの描画
  ctx.fillStyle = "#8B4513"; // かごの色を茶色に変更
  ctx.fillRect(basket.x, basket.y, basket.width, basket.height);

  // かごの編み目パターン
  ctx.strokeStyle = "#654321"; // より暗い茶色
  ctx.lineWidth = 2;

  // 横線（編み目）
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(basket.x, basket.y + (i * basket.height) / 2);
    ctx.lineTo(basket.x + basket.width, basket.y + (i * basket.height) / 2);
    ctx.stroke();
  }

  // 縦線（編み目）
  for (let i = 0; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(basket.x + (i * basket.width) / 5, basket.y);
    ctx.lineTo(basket.x + (i * basket.width) / 5, basket.y + basket.height);
    ctx.stroke();
  }

  // かごの上部の縁
  ctx.strokeStyle = "#654321";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(basket.x - 2, basket.y);
  ctx.lineTo(basket.x + basket.width + 2, basket.y);
  ctx.stroke();

  // かごの影
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.ellipse(
    basket.x + basket.width / 2,
    basket.y + basket.height + 2,
    basket.width / 2,
    4,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // オブジェクトの更新と描画
  gameObjects.forEach((obj, index) => {
    // オブジェクトの移動
    obj.y += obj.speed;

    // 花びらのゆらゆら動き
    if (obj.isSakura) {
      obj.x = obj.originalX + Math.sin(obj.y * 0.02 + obj.swayOffset) * 20;
    }

    if (obj.isSakura) {
      // 桜の花びらの描画
      ctx.save();
      ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);

      // 花びらの形状
      ctx.beginPath();
      ctx.fillStyle = "#FFB7C5";

      // 左側を尖らせた形状とくの字型の切れ込み
      ctx.beginPath();
      ctx.moveTo(-obj.width / 2, 0);

      // 左側から上部にかけての曲線（より尖った形状）
      ctx.quadraticCurveTo(
        -obj.width / 3,
        -obj.height / 4, // 制御点を調整して尖らせる
        0,
        -obj.height / 2
      );

      // 上部から切れ込みの開始点まで
      ctx.quadraticCurveTo(
        obj.width / 3,
        -obj.height / 2,
        obj.width / 3,
        -obj.height / 6
      );

      // くの字型の切れ込み
      ctx.lineTo(obj.width / 4, 0);
      ctx.lineTo(obj.width / 3, obj.height / 6);

      // 右下部分
      ctx.quadraticCurveTo(obj.width / 3, obj.height / 2, 0, obj.height / 2);

      // 下部から左側に戻る（より尖った形状）
      ctx.quadraticCurveTo(
        -obj.width / 3,
        obj.height / 4, // 制御点を調整して尖らせる
        -obj.width / 2,
        0
      );

      ctx.fill();

      ctx.restore();
    } else {
      // 毛虫の描画
      ctx.save();
      ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);

      // 体の部分（複数の円で表現）
      const segments = 5;
      ctx.fillStyle = "#90EE90"; // ライトグリーン
      for (let i = 0; i < segments; i++) {
        ctx.beginPath();
        ctx.arc(
          (i * obj.width) / 6 - obj.width / 3,
          Math.sin(obj.y * 0.1 + i) * 3, // うねうね動く
          obj.width / 5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // 毛（短い線）
      ctx.strokeStyle = "#ADFFAD";
      ctx.lineWidth = 2;
      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < 6; j++) {
          ctx.beginPath();
          const x = (i * obj.width) / 6 - obj.width / 3;
          const y = Math.sin(obj.y * 0.1 + i) * 3;
          const angle = (j * Math.PI * 2) / 6;
          ctx.moveTo(x, y);
          ctx.lineTo(
            x + (Math.cos(angle) * obj.width) / 4,
            y + (Math.sin(angle) * obj.width) / 4
          );
          ctx.stroke();
        }
      }

      // 頭の部分
      ctx.fillStyle = "#7FBF7F";
      ctx.beginPath();
      ctx.arc(
        -obj.width / 3,
        Math.sin(obj.y * 0.1) * 3,
        obj.width / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // 目
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(
        -obj.width / 2.5,
        Math.sin(obj.y * 0.1) * 3 - 2,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }

    // 衝突判定
    if (
      obj.y + obj.height > basket.y &&
      obj.x < basket.x + basket.width &&
      obj.x + obj.width > basket.x
    ) {
      score += obj.isSakura ? 1 : -1;
      gameObjects.splice(index, 1);
    }

    // 画面外に出たオブジェクトの削除
    if (obj.y > canvas.height) {
      gameObjects.splice(index, 1);
    }
  });

  // 全てのオブジェクトが生成済みで、画面上にオブジェクトが残っていない場合、ゲーム終了
  if (
    sakuraGenerated >= totalSakuraToGenerate &&
    bugsGenerated >= totalBugsToGenerate &&
    gameObjects.length === 0
  ) {
    endGame();
    return;
  }

  // スコアの表示更新
  document.getElementById("score").textContent = `スコア: ${score}`;

  // ランダムな間隔でオブジェクトを生成
  if (timestamp - lastObjectTime > nextObjectInterval) {
    // まだ生成できるオブジェクトが残っているか確認
    const canGenerateSakura = sakuraGenerated < totalSakuraToGenerate;
    const canGenerateBug = bugsGenerated < totalBugsToGenerate;

    if (canGenerateSakura || canGenerateBug) {
      // 残りの生成数に基づいて確率を調整
      const remainingSakura = totalSakuraToGenerate - sakuraGenerated;
      const remainingBugs = totalBugsToGenerate - bugsGenerated;
      const totalRemaining = remainingSakura + remainingBugs;

      // 残り数の比率に基づいて生成
      const sakuraProbability = remainingSakura / totalRemaining;
      const isSakura = Math.random() < sakuraProbability;

      if ((isSakura && canGenerateSakura) || (!isSakura && !canGenerateBug)) {
        createObject(true);
        sakuraGenerated++;
      } else {
        createObject(false);
        bugsGenerated++;
      }

      lastObjectTime = timestamp;
      // 次の生成までの間隔をランダムに設定
      nextObjectInterval =
        Math.random() * (maxInterval - minInterval) + minInterval;
    }
  }

  requestAnimationFrame(gameLoop);
}

// キャンバスのサイズ設定を修正
function resizeCanvas() {
  // ビューポートの幅と高さを取得
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // キャンバスのサイズを設定
  canvas.width = Math.min(viewportWidth * 0.9, 400);
  canvas.height = Math.min(viewportHeight * 0.8, 600);

  // かごのサイズと位置を画面サイズに応じて調整
  basket.width = canvas.width * 0.15;
  basket.height = canvas.height * 0.05;
  // かごの位置を下に移動（底から15%上）
  basket.y = canvas.height - canvas.height * 0.15;
}

// ウィンドウサイズが変更されたときにキャンバスをリサイズ
window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

// 初期化時にもリサイズを実行
resizeCanvas();

// ピンチズーム防止
document.addEventListener("gesturestart", (e) => {
  e.preventDefault();
});
