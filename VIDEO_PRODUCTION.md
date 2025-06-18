# Video Production Pipeline

This document covers AquaGuardian's comprehensive video production system for creating marketing demos and product showcases.

## 🎬 Overview

AquaGuardian includes a complete video production pipeline that generates professional demo videos from the application's storyboard system. The pipeline supports automated voice-over generation, scene transitions, and export to multiple formats.

## 🎯 Video Specifications

### Output Formats
- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30 FPS
- **Duration**: 3 minutes (180 seconds)
- **Format**: MP4 (H.264)
- **Quality**: CRF 23 (balanced) or CRF 18 (high quality)

### Scene Structure
- **7 Scenes**: Each with specific timing and content
- **Smooth Transitions**: Fade and slide effects between scenes
- **Title Overlays**: Dynamic text overlays with timing
- **Voice-over Integration**: ElevenLabs API for professional narration

## 🎨 Interactive Storyboard

### Accessing the Storyboard

```bash
# Open the interactive storyboard
npm run storyboard
# or manually open: public/storyboard.html
```

### Features

- **Visual Timeline**: 7 scenes over 3 minutes with progress tracking
- **Interactive Controls**: Play, pause, reset functionality
- **Voice-over Integration**: ElevenLabs API integration with Bella voice
- **Real-time Preview**: Live preview of scene transitions
- **Keyboard Controls**: Space (play/pause), R (reset), V (voice-over)

### Scene Breakdown

| Scene | Duration | Content | Voice-over Script |
|-------|----------|---------|-------------------|
| **1** | 0-15s | Welcome & Branding | "Welcome to AquaGuardian, the revolutionary platform for designing and simulating aquaponic systems. Transform your vision of sustainable agriculture into reality." |
| **2** | 15-45s | Design Wizard | "Our intuitive design wizard walks you through five simple steps. Choose your farm size, select fish species, pick your crops, set your budget, and configure your energy source. It's that easy." |
| **3** | 45-75s | Simulation Engine | "Watch your system come to life with real-time performance simulation. See projected yields, water usage, energy consumption, and system efficiency. Our advanced algorithms predict your success." |
| **4** | 75-105s | Analytics Dashboard | "Dive deep into comprehensive analytics with beautiful charts and metrics. Track 30-day performance projections, monitor resource efficiency, and optimize your system for maximum productivity." |
| **5** | 105-135s | Blockchain Features | "Revolutionary blockchain integration lets you tokenize your aquaponic systems. Create digital assets, enable fractional ownership, and participate in the future of decentralized agriculture on the carbon-negative Algorand network." |
| **6** | 135-165s | Pro Subscription | "Upgrade to Pro Designer for unlimited simulations, advanced analytics, priority support, and commercial usage rights. Join thousands of users building the future of sustainable agriculture." |
| **7** | 165-180s | Call to Action | "Ready to revolutionize your approach to sustainable agriculture? Visit aquaguardian.green and start designing your perfect aquaponic system today. The future of farming is in your hands." |

## 🎙️ Voice-over Generation

### ElevenLabs Integration

Set up ElevenLabs for professional voice-over generation:

```bash
# Set your ElevenLabs API key
export ELEVEN_API_KEY=your_api_key_here

# Or add to .env file
echo "ELEVEN_API_KEY=your_api_key_here" >> .env
```

### Voice Configuration

- **Voice Model**: Bella (EXAVITQu4vr4xnSDxMaL)
- **Model**: eleven_monolingual_v1
- **Stability**: 0.5
- **Similarity Boost**: 0.5
- **Output Format**: MP3 audio

### Voice-over Process

1. **Text Processing**: Each scene's script is processed individually
2. **API Calls**: Parallel generation for all scenes
3. **Audio Storage**: Temporary blob URLs for playback
4. **Synchronization**: Audio timing matches scene duration
5. **Error Handling**: Graceful fallback for API failures

## 📁 Asset Management

### Required Demo Assets

Place these PNG files in `/demo-assets/` directory:

```
demo-assets/
├── hero-splash.png           # Welcome screen (0-15s)
├── wizard-flow.png           # Design wizard (15-45s)
├── simulation-dashboard.png  # Performance simulation (45-75s)
├── analytics-charts.png      # Analytics dashboard (75-105s)
├── tokenization-interface.png # Blockchain features (105-135s)
├── pro-features.png          # Pro subscription (135-165s)
└── call-to-action.png        # Final CTA (165-180s)
```

### Asset Requirements

- **Format**: PNG (optimized for video)
- **Resolution**: 1920x1080 or higher
- **Compression**: Optimized for web delivery
- **Content**: Screenshots from actual application
- **Naming**: Descriptive, kebab-case filenames

## 🎥 Video Generation

### Automated Build Process

```bash
# Build the complete demo video
npm run build:video
```

This command:
- ✅ Checks for FFmpeg installation
- 📁 Validates all demo assets exist
- 🎬 Combines PNG sequences with timing
- 🎵 Adds title overlays and transitions
- 📊 Outputs production-ready MP4

### Build Script Features

The `scripts/build-video.js` script provides:

1. **Dependency Checking**: Verifies FFmpeg installation
2. **Asset Validation**: Ensures all required PNGs exist
3. **Output Directory**: Creates `dist/` folder if needed
4. **Progress Tracking**: Real-time build progress
5. **Error Handling**: Graceful failure with cleanup
6. **Alternative Commands**: Provides manual FFmpeg options

### FFmpeg Configuration

#### Basic Video Generation
```bash
ffmpeg -y \
  -loop 1 -t 15 -i "demo-assets/hero-splash.png" \
  -loop 1 -t 30 -i "demo-assets/wizard-flow.png" \
  -loop 1 -t 30 -i "demo-assets/simulation-dashboard.png" \
  -loop 1 -t 30 -i "demo-assets/analytics-charts.png" \
  -loop 1 -t 30 -i "demo-assets/tokenization-interface.png" \
  -loop 1 -t 30 -i "demo-assets/pro-features.png" \
  -loop 1 -t 15 -i "demo-assets/call-to-action.png" \
  -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v0];[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v1];[2:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v2];[3:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v3];[4:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v4];[5:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v5];[6:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v6];[v0][v1][v2][v3][v4][v5][v6]concat=n=7:v=1:a=0[outv]" \
  -map "[outv]" \
  -c:v libx264 \
  -preset medium \
  -crf 23 \
  -pix_fmt yuv420p \
  demo.mp4
```

#### High Quality Version
```bash
# High quality with slower encoding
ffmpeg -y [same inputs] \
  -c:v libx264 \
  -preset slow \
  -crf 18 \
  -pix_fmt yuv420p \
  demo-hq.mp4
```

#### With Title Overlays
```bash
# Add dynamic title overlays
-filter_complex "[outv]drawtext=text='Welcome to AquaGuardian':fontfile=/System/Library/Fonts/Arial.ttf:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='between(t,0,15)'[title0];[title0]drawtext=text='Design Wizard':fontfile=/System/Library/Fonts/Arial.ttf:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='between(t,15,45)'[final]"
```

## 🔧 Development Setup

### Prerequisites

Install FFmpeg on your system:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Environment Variables

```bash
# Optional: ElevenLabs API key for voice-over
ELEVEN_API_KEY=your_elevenlabs_api_key
```

### Local Development

1. **Create Demo Assets**: Take screenshots of your application
2. **Place in Directory**: Save as PNG files in `/demo-assets/`
3. **Test Storyboard**: Run `npm run storyboard` to preview
4. **Generate Video**: Run `npm run build:video` to create MP4

## 🎨 Customization Options

### Scene Timing

Modify scene durations in `scripts/build-video.js`:

```javascript
const scenes = [
  { image: 'hero-splash.png', duration: 15, title: 'Welcome to AquaGuardian' },
  { image: 'wizard-flow.png', duration: 30, title: 'Design Wizard' },
  // ... modify durations as needed
]
```

### Voice-over Scripts

Update voice-over text in `public/storyboard.html`:

```html
<div class="scene" data-voice="Your custom voice-over script here">
  <!-- Scene content -->
</div>
```

### Visual Styling

Customize storyboard appearance:

```css
/* In public/storyboard.html <style> section */
.scene-content {
  /* Modify scene styling */
}

.progress-bar {
  /* Customize progress bar */
}
```

## 📊 Quality Assurance

### Video Quality Checklist

- ✅ **Resolution**: 1920x1080 confirmed
- ✅ **Duration**: Exactly 180 seconds
- ✅ **Frame Rate**: Consistent 30 FPS
- ✅ **Audio Sync**: Voice-over matches scenes
- ✅ **Transitions**: Smooth scene changes
- ✅ **Text Overlays**: Readable and well-timed
- ✅ **File Size**: Reasonable for web delivery

### Testing Process

1. **Asset Validation**: Verify all PNGs exist and are correct size
2. **Storyboard Preview**: Test interactive storyboard functionality
3. **Voice-over Test**: Generate and play voice-over segments
4. **Video Generation**: Create test video and review quality
5. **Cross-platform Test**: Verify video plays on different devices

## 🚀 Production Deployment

### Video Hosting

Recommended platforms for hosting the demo video:

1. **YouTube**: Best for SEO and discoverability
2. **Vimeo**: Professional presentation and customization
3. **Netlify**: Direct hosting with your application
4. **CDN**: For fast global delivery

### Optimization

```bash
# Compress for web delivery
ffmpeg -i demo.mp4 -c:v libx264 -crf 28 -preset fast demo-compressed.mp4

# Create thumbnail
ffmpeg -i demo.mp4 -ss 00:00:05 -vframes 1 demo-thumbnail.jpg
```

### Integration

Embed the video in your application:

```html
<!-- HTML5 Video -->
<video controls poster="demo-thumbnail.jpg">
  <source src="demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

<!-- YouTube Embed -->
<iframe src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>
```

## 🔍 Troubleshooting

### Common Issues

1. **FFmpeg Not Found**
   ```bash
   # Install FFmpeg
   brew install ffmpeg  # macOS
   sudo apt install ffmpeg  # Ubuntu
   ```

2. **Missing Demo Assets**
   ```bash
   # Check required files
   ls demo-assets/
   # Should show all 7 PNG files
   ```

3. **ElevenLabs API Errors**
   ```bash
   # Verify API key
   echo $ELEVEN_API_KEY
   # Check API quota and billing
   ```

4. **Video Quality Issues**
   ```bash
   # Use higher quality settings
   ffmpeg ... -crf 18 -preset slow ...
   ```

### Performance Optimization

- **Parallel Processing**: Generate voice-over segments in parallel
- **Caching**: Cache generated audio files locally
- **Compression**: Optimize PNG assets before video generation
- **Progressive Loading**: Stream video while generating

## 📈 Analytics & Metrics

### Video Performance Tracking

Monitor video engagement:

- **View Duration**: Average watch time
- **Completion Rate**: Percentage who watch to end
- **Click-through Rate**: Conversion to application
- **Social Shares**: Viral coefficient

### A/B Testing

Test different versions:

- **Voice-over Variations**: Different scripts or voices
- **Scene Order**: Rearrange content flow
- **Duration**: Test shorter/longer versions
- **Call-to-Action**: Different ending approaches

---

This video production pipeline enables AquaGuardian to create professional marketing content that showcases the platform's capabilities and drives user engagement.