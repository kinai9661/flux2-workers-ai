# 🎨 FLUX.2 Image Generator

> Powered by Cloudflare Workers AI - Professional image generation with multi-reference support

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/kinai9661/flux2-workers-ai)

## ✨ Features

- 🖼️ **Multi-Reference Images**: Upload up to 4 reference images (512x512) for character consistency
- 📝 **Dual Prompt Modes**: Text mode for quick generation, JSON mode for precise control
- 🎨 **HEX Color Support**: Specify exact colors using hex codes (e.g., `#F48120`)
- ⚙️ **Advanced Controls**:
  - Steps: 1-50 (inference steps)
  - Guidance: 1-20 (prompt adherence)
  - Dimensions: 256-1920 pixels (max 4MP)
  - Seed: Optional for reproducible results
- 🌐 **Multi-Language**: Supports Chinese, English, and other languages
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Zero Dependencies**: Pure vanilla JavaScript, no build required

## 🚀 Quick Deploy

### Method 1: One-Click Deploy

1. Click the deploy button above
2. Connect your Cloudflare account
3. Deploy instantly!

### Method 2: Manual Deploy with Wrangler

```bash
# Clone the repository
git clone https://github.com/kinai9661/flux2-workers-ai.git
cd flux2-workers-ai

# Install Wrangler CLI (if not installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy to Workers
wrangler deploy
```

## 📖 Usage

### Text Mode

Simply describe what you want to generate:

```
A cyberpunk street market at night, neon lights reflecting on wet pavement, 
rain falling, detailed and atmospheric
```

### JSON Mode

For precise control over every aspect:

```json
{
  "scene": "A futuristic coffee shop in Hong Kong, neon signs in Chinese",
  "subjects": [{
    "type": "Barista robot",
    "description": "Metallic chrome surface with blue LED eyes",
    "position": "background"
  }],
  "style": "cyberpunk photography",
  "color_palette": ["#F48120", "#667eea", "#764ba2"],
  "lighting": "Moody neon lighting with strong contrast",
  "camera": {
    "angle": "eye level",
    "lens": "35mm",
    "f-number": "f/1.4"
  }
}
```

### Multi-Reference Images

1. Click "選擇圖片" to upload 1-4 reference images
2. Images will be used for:
   - Character consistency across generations
   - Product rendering with different backgrounds
   - Style transfer and artistic control
3. Combine with prompts like:
   ```
   take the subject of image 1 and style it like image 2
   ```

## 🛠️ API Usage

### cURL Example

```bash
curl -X POST https://your-worker.workers.dev/api/generate \
  -F "prompt=A beautiful sunset over the ocean" \
  -F "steps=25" \
  -F "guidance=3.5" \
  -F "width=1024" \
  -F "height=768"
```

### With Reference Images

```bash
curl -X POST https://your-worker.workers.dev/api/generate \
  -F "prompt=take the subject of image 1 and put it in a beach scene" \
  -F "input_image_0=@/path/to/image1.png" \
  -F "input_image_1=@/path/to/image2.png" \
  -F "steps=25" \
  -F "width=1024" \
  -F "height=1024"
```

### JavaScript Example

```javascript
const formData = new FormData();
formData.append('prompt', 'A serene mountain landscape');
formData.append('steps', '30');
formData.append('guidance', '5');
formData.append('width', '1024');
formData.append('height', '768');

const response = await fetch('https://your-worker.workers.dev/api/generate', {
  method: 'POST',
  body: formData
});

const result = await response.json();
const imageBase64 = result.image; // Base64 encoded PNG
```

## 🎯 Use Cases

- **E-commerce**: Generate consistent product shots with different backgrounds
- **Marketing**: Create ad variations with the same model/character
- **Creative Photography**: Photorealistic images with accurate lighting and details
- **Digital Assets**: Design landing pages, infographics, and UI elements
- **Character Design**: Maintain character consistency across multiple scenes

## 📋 Requirements

- Cloudflare account (Free tier works!)
- Workers AI enabled (automatically included)

## 🔧 Configuration

Edit `wrangler.toml` to customize:

```toml
name = "flux2-image-generator"  # Your worker name
main = "src/index.js"
compatibility_date = "2024-11-25"

[ai]
binding = "AI"  # Workers AI binding
```

## 📚 Model Details

- **Model**: `@cf/black-forest-labs/flux-2-dev`
- **Input**: Text prompts + optional reference images (up to 4)
- **Output**: Base64 encoded PNG images
- **Max Resolution**: 1920x1920 (4 megapixels)
- **Reference Image Size**: 512x512 recommended

## 🌟 Features Explained

### Character Consistency

FLUX.2 solves "stochastic drift" - the problem where generated characters change between images. Upload reference images to maintain:
- Facial features
- Product designs
- Style elements
- Brand consistency

### JSON Prompting

Structured prompts give you control over:
- Scene composition
- Subject details and positioning
- Color palettes (with exact HEX codes)
- Lighting and mood
- Camera settings (lens, f-number, angle)
- Special effects

### Physical World Grounding

The model excels at:
- Realistic lighting and shadows
- Accurate hands, faces, and small objects
- Depth perception and perspective
- Fabric textures and materials
- Logos and text rendering

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🔗 References

- [Cloudflare Blog: FLUX.2 Workers AI](https://blog.cloudflare.com/flux-2-workers-ai/)
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [FLUX.2 Model Card](https://developers.cloudflare.com/workers-ai/models/flux-2-dev/)
- [Black Forest Labs](https://blackforestlabs.ai/)

## 💬 Support

For issues and questions:
- Open an issue on GitHub
- Check [Cloudflare Community](https://community.cloudflare.com/)
- Read the [Workers AI docs](https://developers.cloudflare.com/workers-ai/)

---

**Built with ❤️ using Cloudflare Workers AI**
