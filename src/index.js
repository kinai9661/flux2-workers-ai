export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS 處理
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 返回前端頁面
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    // API 端點：生成圖片
    if (url.pathname === "/api/generate" && request.method === "POST") {
      try {
        const formData = await request.formData();
        
        // 創建新的 FormData 給 Workers AI
        const aiFormData = new FormData();
        
        // 獲取提示詞（支持普通文本和 JSON）
        const prompt = formData.get("prompt");
        if (!prompt) {
          return jsonResponse({ error: "Prompt is required" }, 400);
        }
        aiFormData.append("prompt", prompt);

        // 處理參考圖片（最多 4 張）
        for (let i = 0; i < 4; i++) {
          const imageFile = formData.get(`input_image_${i}`);
          if (imageFile && imageFile.size > 0) {
            aiFormData.append(`input_image_${i}`, imageFile);
          }
        }

        // 添加可選參數
        const steps = formData.get("steps") || "25";
        const guidance = formData.get("guidance") || "3.5";
        const width = formData.get("width") || "1024";
        const height = formData.get("height") || "768";
        const seed = formData.get("seed");

        aiFormData.append("steps", steps);
        aiFormData.append("guidance", guidance);
        aiFormData.append("width", width);
        aiFormData.append("height", height);
        if (seed) aiFormData.append("seed", seed);

        // 調用 Workers AI FLUX.2 模型
        const response = await env.AI.run(
          "@cf/black-forest-labs/flux-2-dev",
          {
            multipart: {
              body: aiFormData,
              contentType: "multipart/form-data",
            },
          }
        );

        // 返回生成的圖片
        return jsonResponse({
          success: true,
          image: response.image, // Base64 編碼的圖片
        });

      } catch (error) {
        console.error("Generation error:", error);
        return jsonResponse(
          { error: error.message || "Image generation failed" },
          500
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

const HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FLUX.2 Image Generator - Cloudflare Workers AI</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .card h2 {
      font-size: 1.5rem;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-weight: 600;
      color: #555;
      margin-bottom: 8px;
      font-size: 0.95rem;
    }

    input[type="text"],
    input[type="number"],
    textarea,
    select {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    input[type="text"]:focus,
    input[type="number"]:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: #667eea;
    }

    textarea {
      min-height: 120px;
      resize: vertical;
      font-family: inherit;
    }

    input[type="file"] {
      display: none;
    }

    .file-upload-label {
      display: inline-block;
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s;
      font-size: 0.9rem;
    }

    .file-upload-label:hover {
      background: #5568d3;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 10px;
    }

    .preview-item {
      position: relative;
      border: 2px dashed #ddd;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 1;
    }

    .preview-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-item .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
      font-size: 0.9rem;
    }

    .remove-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(255,0,0,0.8);
      color: white;
      border: none;
      border-radius: 50%;
      width: 25px;
      height: 25px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    }

    .advanced-params {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .generate-btn {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 10px;
    }

    .generate-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .generate-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .output-area {
      text-align: center;
    }

    .loading {
      display: none;
      color: #667eea;
      margin: 20px 0;
    }

    .loading.active {
      display: block;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    #outputImage {
      max-width: 100%;
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      display: none;
    }

    #outputImage.active {
      display: block;
    }

    .download-btn {
      display: none;
      margin-top: 15px;
      padding: 12px 30px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .download-btn.active {
      display: inline-block;
    }

    .download-btn:hover {
      background: #218838;
    }

    .error {
      display: none;
      color: #dc3545;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      padding: 12px;
      margin: 15px 0;
    }

    .error.active {
      display: block;
    }

    .mode-toggle {
      margin-bottom: 15px;
    }

    .mode-toggle button {
      padding: 8px 16px;
      margin-right: 10px;
      border: 2px solid #667eea;
      background: white;
      color: #667eea;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .mode-toggle button.active {
      background: #667eea;
      color: white;
    }

    .json-mode {
      display: none;
    }

    .json-mode.active {
      display: block;
    }

    .info-box {
      background: #e7f3ff;
      border-left: 4px solid #2196F3;
      padding: 12px;
      margin-bottom: 15px;
      border-radius: 4px;
      font-size: 0.9rem;
      color: #555;
    }

    @media (max-width: 768px) {
      .main-content {
        grid-template-columns: 1fr;
      }
      
      .advanced-params {
        grid-template-columns: 1fr;
      }
      
      .header h1 {
        font-size: 1.8rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 FLUX.2 圖像生成器</h1>
      <p>基於 Cloudflare Workers AI - 支持多圖參考、JSON 提示和精確控制</p>
    </div>

    <div class="main-content">
      <!-- 左側：輸入控制 -->
      <div class="card">
        <h2>⚙️ 生成設置</h2>
        
        <div class="mode-toggle">
          <button class="mode-btn active" data-mode="text">文本模式</button>
          <button class="mode-btn" data-mode="json">JSON 模式</button>
        </div>

        <form id="generateForm">
          <!-- 文本模式 -->
          <div class="text-mode">
            <div class="form-group">
              <label for="prompt">提示詞 *</label>
              <textarea 
                id="prompt" 
                name="prompt" 
                placeholder="描述你想生成的圖片，支持中文、英文等多語言&#10;例如：A sunset over the ocean with a sailing boat"
                required
              ></textarea>
            </div>
          </div>

          <!-- JSON 模式 -->
          <div class="json-mode">
            <div class="info-box">
              💡 JSON 模式允許精確控制場景、主體、風格、顏色（支持 HEX 色碼如 #F48120）、光照等細節
            </div>
            <div class="form-group">
              <label for="jsonPrompt">JSON 提示詞 *</label>
              <textarea 
                id="jsonPrompt" 
                name="jsonPrompt" 
                placeholder='{\n  "scene": "描述場景",\n  "style": "藝術風格",\n  "color_palette": ["#667eea", "#764ba2"],\n  "lighting": "光照描述"\n}'
              ></textarea>
            </div>
          </div>

          <!-- 參考圖片上傳 -->
          <div class="form-group">
            <label>參考圖片（最多 4 張，512x512）</label>
            <label class="file-upload-label" for="imageUpload">
              📁 選擇圖片
            </label>
            <input 
              type="file" 
              id="imageUpload" 
              accept="image/*" 
              multiple
            >
            <div class="preview-grid" id="previewGrid">
              <div class="preview-item" data-index="0">
                <div class="placeholder">圖片 1</div>
              </div>
              <div class="preview-item" data-index="1">
                <div class="placeholder">圖片 2</div>
              </div>
              <div class="preview-item" data-index="2">
                <div class="placeholder">圖片 3</div>
              </div>
              <div class="preview-item" data-index="3">
                <div class="placeholder">圖片 4</div>
              </div>
            </div>
          </div>

          <!-- 高級參數 -->
          <div class="form-group">
            <label>高級參數</label>
            <div class="advanced-params">
              <div>
                <label for="steps">Steps (推理步數)</label>
                <input 
                  type="number" 
                  id="steps" 
                  name="steps" 
                  value="25" 
                  min="1" 
                  max="50"
                >
              </div>
              <div>
                <label for="guidance">Guidance (引導強度)</label>
                <input 
                  type="number" 
                  id="guidance" 
                  name="guidance" 
                  value="3.5" 
                  min="1" 
                  max="20" 
                  step="0.1"
                >
              </div>
              <div>
                <label for="width">寬度 (256-1920)</label>
                <input 
                  type="number" 
                  id="width" 
                  name="width" 
                  value="1024" 
                  min="256" 
                  max="1920" 
                  step="64"
                >
              </div>
              <div>
                <label for="height">高度 (256-1920)</label>
                <input 
                  type="number" 
                  id="height" 
                  name="height" 
                  value="768" 
                  min="256" 
                  max="1920" 
                  step="64"
                >
              </div>
              <div>
                <label for="seed">Seed (可選)</label>
                <input 
                  type="number" 
                  id="seed" 
                  name="seed" 
                  placeholder="留空為隨機"
                >
              </div>
            </div>
          </div>

          <button type="submit" class="generate-btn">
            🚀 生成圖片
          </button>
        </form>
      </div>

      <!-- 右側：輸出結果 -->
      <div class="card">
        <h2>🖼️ 生成結果</h2>
        
        <div class="output-area">
          <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>正在生成圖片，請稍候...</p>
          </div>
          
          <div class="error" id="error"></div>
          
          <img id="outputImage" alt="Generated Image">
          
          <button class="download-btn" id="downloadBtn">
            💾 下載圖片
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('generateForm');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const outputImage = document.getElementById('outputImage');
    const downloadBtn = document.getElementById('downloadBtn');
    const imageUpload = document.getElementById('imageUpload');
    const previewGrid = document.getElementById('previewGrid');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const textMode = document.querySelector('.text-mode');
    const jsonMode = document.querySelector('.json-mode');

    let uploadedImages = [];

    // 模式切換
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const mode = btn.dataset.mode;
        if (mode === 'json') {
          textMode.style.display = 'none';
          jsonMode.classList.add('active');
        } else {
          textMode.style.display = 'block';
          jsonMode.classList.remove('active');
        }
      });
    });

    // 圖片上傳預覽
    imageUpload.addEventListener('change', (e) => {
      const files = Array.from(e.target.files).slice(0, 4);
      uploadedImages = files;
      
      // 清空所有預覽
      document.querySelectorAll('.preview-item').forEach(item => {
        const index = item.dataset.index;
        item.innerHTML = '<div class="placeholder">圖片 ' + (parseInt(index) + 1) + '</div>';
      });

      // 顯示新預覽
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewItem = document.querySelector(\`.preview-item[data-index="\${index}"]\`);
          previewItem.innerHTML = \`
            <img src="\${e.target.result}" alt="Preview \${index + 1}">
            <button type="button" class="remove-btn" onclick="removeImage(\${index})">×</button>
          \`;
        };
        reader.readAsDataURL(file);
      });
    });

    // 移除圖片
    window.removeImage = (index) => {
      uploadedImages.splice(index, 1);
      imageUpload.value = '';
      
      // 重新渲染預覽
      document.querySelectorAll('.preview-item').forEach(item => {
        const idx = item.dataset.index;
        item.innerHTML = '<div class="placeholder">圖片 ' + (parseInt(idx) + 1) + '</div>';
      });

      uploadedImages.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewItem = document.querySelector(\`.preview-item[data-index="\${idx}"]\`);
          previewItem.innerHTML = \`
            <img src="\${e.target.result}" alt="Preview \${idx + 1}">
            <button type="button" class="remove-btn" onclick="removeImage(\${idx})">×</button>
          \`;
        };
        reader.readAsDataURL(file);
      });
    };

    // 表單提交
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // 清空之前的結果
      outputImage.classList.remove('active');
      downloadBtn.classList.remove('active');
      error.classList.remove('active');
      loading.classList.add('active');

      try {
        const formData = new FormData();
        
        // 獲取提示詞
        const isJsonMode = document.querySelector('.mode-btn[data-mode="json"]').classList.contains('active');
        const prompt = isJsonMode ? 
          document.getElementById('jsonPrompt').value : 
          document.getElementById('prompt').value;
        
        if (!prompt.trim()) {
          throw new Error('請輸入提示詞');
        }
        
        formData.append('prompt', prompt);

        // 添加參考圖片
        uploadedImages.forEach((file, index) => {
          formData.append(\`input_image_\${index}\`, file);
        });

        // 添加參數
        formData.append('steps', document.getElementById('steps').value);
        formData.append('guidance', document.getElementById('guidance').value);
        formData.append('width', document.getElementById('width').value);
        formData.append('height', document.getElementById('height').value);
        
        const seed = document.getElementById('seed').value;
        if (seed) {
          formData.append('seed', seed);
        }

        // 發送請求
        const response = await fetch('/api/generate', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || '生成失敗');
        }

        // 顯示結果
        loading.classList.remove('active');
        outputImage.src = \`data:image/png;base64,\${result.image}\`;
        outputImage.classList.add('active');
        downloadBtn.classList.add('active');

      } catch (err) {
        loading.classList.remove('active');
        error.textContent = '❌ ' + err.message;
        error.classList.add('active');
      }
    });

    // 下載圖片
    downloadBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = \`flux2-\${Date.now()}.png\`;
      link.href = outputImage.src;
      link.click();
    });
  </script>
</body>
</html>`;
