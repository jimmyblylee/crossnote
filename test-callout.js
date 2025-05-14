const fs = require('fs');
const path = require('path');
const { MarkdownEngine, Notebook } = require('./out/cjs/index.cjs');

async function testCallout() {
  try {
    // 读取测试文件
    const mdContent = fs.readFileSync('./test-callout.md', 'utf8');
    
    // 创建 Notebook 实例
    const notebook = new Notebook({
      notebookPath: path.resolve('./'),
      config: {
        mathRenderingOption: 'KaTeX',
        mermaidTheme: 'default',
        useRelativeFilePath: true,
        usePandocParser: false,
        imageFolderPath: './',
      }
    });
    
    // 创建 MarkdownEngine 实例
    const engine = new MarkdownEngine({
      filePath: path.resolve('./test-callout.md'),
      fileDirectoryPath: path.resolve('./'),
      notebook: notebook
    });
    
    // 渲染 Markdown 为 HTML
    const html = await engine.generateHTMLTemplateForPreview({ markdown: mdContent });
    
    // 保存渲染结果到 HTML 文件
    fs.writeFileSync('./test-callout.html', html, 'utf8');
    
    console.log('测试完成，结果已保存到 test-callout.html');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

testCallout(); 
