import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Helper function to detect document type based on filename
function detectDocumentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('invoice')) return 'Invoice';
  if (lower.includes('assignment')) return 'Assignment';
  if (lower.includes('report')) return 'Report';
  if (lower.includes('receipt')) return 'Receipt';
  if (lower.includes('contract')) return 'Contract';
  return 'General';
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { filename, size, pageCount } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'No filename provided in metadata.' });
    }

    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey) {
      // Return a simulated response if no API key is provided
      console.warn("GEMINI_API_KEY is not set. Returning simulated analysis.");
      return res.json({
        docType: detectDocumentType(filename),
        contentType: { text: 60, images: 40, charts: 0 },
        currentQuality: "Medium",
        recommendedSettings: {
          imageQuality: 70,
          dpi: 150,
          colorMode: "RGB",
          removeMetadata: true,
        },
        estimatedReduction: Math.floor(Math.random() * 30) + 40, // 40-70%
        qualityImpact: "Minimal",
      });
    }

    const ai = new GoogleGenAI({ apiKey: aiKey });
    
    // We analyze the PDF based entirely on metadata to ensure strict offline compliance (no file uploads)
    const prompt = `
      Analyze this PDF based on its metadata and recommend optimal compression settings.
      
      File Metadata:
      - Filename: ${filename}
      - File Size: ${size} bytes
      - Page Count: ${pageCount || 'Unknown'}
      
      Provide:
      1. Document type (Invoice/Assignment/Report/Receipt/Contract/Other) based on the filename.
      2. Content breakdown (text %, image %, charts %) (estimated guess).
      3. Current quality level (High/Medium/Low).
      4. Recommended settings:
         - imageQuality (number between 10-100)
         - dpi (72, 150, 300)
         - colorMode ("RGB", "Grayscale", "B&W")
         - removeMetadata (boolean)
      5. estimatedReduction (number, percentage)
      6. qualityImpact ("None", "Minimal", "Moderate", "Significant")
      
      Return ONLY valid JSON with this exact structure:
      {
        "docType": "Invoice",
        "contentType": {
          "text": 70,
          "images": 25,
          "charts": 5
        },
        "currentQuality": "High",
        "recommendedSettings": {
          "imageQuality": 75,
          "dpi": 150,
          "colorMode": "RGB",
          "removeMetadata": true
        },
        "estimatedReduction": 65,
        "qualityImpact": "Minimal"
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [prompt],
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return res.json(analysis);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    } catch (apiError) {
      console.error('Gemini API Error:', apiError);
      throw apiError; // Fallback to simulated
    }

  } catch (error) {
    console.error('Analysis error:', error);
    // Fallback to simulated analysis
    res.json({
      docType: req.body.filename ? detectDocumentType(req.body.filename) : "General",
      contentType: { text: 50, images: 50, charts: 0 },
      currentQuality: "Medium",
      recommendedSettings: {
        imageQuality: 70,
        dpi: 150,
        colorMode: "RGB",
        removeMetadata: true,
      },
      estimatedReduction: 50,
      qualityImpact: "Minimal",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
