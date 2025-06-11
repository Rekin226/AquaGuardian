#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * AquaGuardian Video Production Script
 * Generates demo.mp4 from storyboard assets using FFmpeg
 */

const DEMO_ASSETS_DIR = path.join(__dirname, '..', 'demo-assets');
const OUTPUT_DIR = path.join(__dirname, '..', 'dist');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'demo.mp4');

// Scene configuration matching storyboard.html
const scenes = [
    {
        image: 'hero-splash.png',
        duration: 15,
        title: 'Welcome to AquaGuardian'
    },
    {
        image: 'wizard-flow.png', 
        duration: 30,
        title: 'Design Wizard'
    },
    {
        image: 'simulation-dashboard.png',
        duration: 30,
        title: 'Performance Simulation'
    },
    {
        image: 'analytics-charts.png',
        duration: 30,
        title: 'Analytics Dashboard'
    },
    {
        image: 'tokenization-interface.png',
        duration: 30,
        title: 'Blockchain Tokenization'
    },
    {
        image: 'pro-features.png',
        duration: 30,
        title: 'Pro Designer Features'
    },
    {
        image: 'call-to-action.png',
        duration: 15,
        title: 'Get Started Today'
    }
];

function checkDependencies() {
    console.log('🔍 Checking dependencies...');
    
    try {
        execSync('ffmpeg -version', { stdio: 'pipe' });
        console.log('✅ FFmpeg found');
    } catch (error) {
        console.error('❌ FFmpeg not found. Please install FFmpeg:');
        console.error('   macOS: brew install ffmpeg');
        console.error('   Ubuntu: sudo apt install ffmpeg');
        console.error('   Windows: Download from https://ffmpeg.org/download.html');
        process.exit(1);
    }
}

function checkAssets() {
    console.log('📁 Checking demo assets...');
    
    if (!fs.existsSync(DEMO_ASSETS_DIR)) {
        console.error(`❌ Demo assets directory not found: ${DEMO_ASSETS_DIR}`);
        console.error('   Please create the directory and add your PNG assets.');
        process.exit(1);
    }
    
    const missingAssets = [];
    scenes.forEach(scene => {
        const assetPath = path.join(DEMO_ASSETS_DIR, scene.image);
        if (!fs.existsSync(assetPath)) {
            missingAssets.push(scene.image);
        }
    });
    
    if (missingAssets.length > 0) {
        console.error('❌ Missing demo assets:');
        missingAssets.forEach(asset => console.error(`   - ${asset}`));
        console.error('\n   Please add these PNG files to the demo-assets directory.');
        console.error('   You can use placeholder images or screenshots from the app.');
        process.exit(1);
    }
    
    console.log(`✅ All ${scenes.length} demo assets found`);
}

function ensureOutputDir() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
    }
}

function generateFilterComplex() {
    let filterComplex = '';
    let inputs = '';
    
    // Add input files
    scenes.forEach((scene, index) => {
        const assetPath = path.join(DEMO_ASSETS_DIR, scene.image);
        inputs += `-loop 1 -t ${scene.duration} -i "${assetPath}" `;
    });
    
    // Scale and format all inputs
    scenes.forEach((scene, index) => {
        filterComplex += `[${index}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${index}];`;
    });
    
    // Concatenate all video streams
    filterComplex += scenes.map((_, index) => `[v${index}]`).join('') + `concat=n=${scenes.length}:v=1:a=0[outv]`;
    
    return { inputs, filterComplex };
}

function addTitleOverlays() {
    // Generate title overlay filter
    let titleFilter = '';
    let currentTime = 0;
    
    scenes.forEach((scene, index) => {
        const startTime = currentTime;
        const endTime = currentTime + scene.duration;
        
        if (index === 0) {
            titleFilter += `[outv]`;
        } else {
            titleFilter += `[title${index - 1}]`;
        }
        
        titleFilter += `drawtext=text='${scene.title}':fontfile=/System/Library/Fonts/Arial.ttf:fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-100:enable='between(t,${startTime},${endTime})'`;
        
        if (index < scenes.length - 1) {
            titleFilter += `[title${index}];`;
        } else {
            titleFilter += `[final]`;
        }
        
        currentTime += scene.duration;
    });
    
    return titleFilter;
}

function buildVideo() {
    console.log('🎬 Building video with FFmpeg...');
    
    const { inputs, filterComplex } = generateFilterComplex();
    const titleOverlay = addTitleOverlays();
    
    const ffmpegCommand = `ffmpeg -y ${inputs} -filter_complex "${filterComplex};${titleOverlay}" -map "[final]" -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p "${OUTPUT_FILE}"`;
    
    console.log('📝 FFmpeg command:');
    console.log(ffmpegCommand);
    console.log('');
    
    try {
        console.log('⏳ Rendering video... (this may take a few minutes)');
        execSync(ffmpegCommand, { stdio: 'inherit' });
        console.log(`✅ Video successfully created: ${OUTPUT_FILE}`);
        
        // Get file size
        const stats = fs.statSync(OUTPUT_FILE);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`📊 File size: ${fileSizeMB} MB`);
        
    } catch (error) {
        console.error('❌ FFmpeg failed:', error.message);
        process.exit(1);
    }
}

function generateAlternativeCommands() {
    console.log('\n📋 Alternative FFmpeg commands for manual execution:');
    console.log('');
    
    // Simple concatenation without titles
    console.log('🔸 Simple concatenation (no titles):');
    const simpleInputs = scenes.map((scene, index) => 
        `-loop 1 -t ${scene.duration} -i "demo-assets/${scene.image}"`
    ).join(' ');
    
    const simpleFilter = scenes.map((_, index) => 
        `[${index}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30[v${index}]`
    ).join(';') + ';' + scenes.map((_, index) => `[v${index}]`).join('') + `concat=n=${scenes.length}:v=1:a=0[outv]`;
    
    console.log(`ffmpeg -y ${simpleInputs} -filter_complex "${simpleFilter}" -map "[outv]" -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p demo.mp4`);
    console.log('');
    
    // With fade transitions
    console.log('🔸 With fade transitions:');
    console.log('ffmpeg -y [inputs] -filter_complex "[transitions_filter]" -map "[outv]" -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p demo-with-fades.mp4');
    console.log('');
    
    // High quality version
    console.log('🔸 High quality version:');
    console.log(`ffmpeg -y ${simpleInputs} -filter_complex "${simpleFilter}" -map "[outv]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p demo-hq.mp4`);
}

// Main execution
function main() {
    console.log('🎥 AquaGuardian Video Production Pipeline');
    console.log('==========================================\n');
    
    checkDependencies();
    checkAssets();
    ensureOutputDir();
    buildVideo();
    generateAlternativeCommands();
    
    console.log('\n🎉 Video production complete!');
    console.log(`📁 Output: ${OUTPUT_FILE}`);
    console.log('🌐 Upload to your preferred video hosting platform.');
}

if (require.main === module) {
    main();
}

module.exports = { scenes, generateFilterComplex, buildVideo };