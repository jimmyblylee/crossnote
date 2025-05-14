// Callout syntax parser for markdown-it
// Callout syntax: > [!NOTE] This is a note

import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';

export default (md: MarkdownIt) => {
  const CALLOUT_REGEX = /^\s*>\s*\[!(\w+)\](?:\s+(.+))?/;
  
  // 存储原始的blockquote规则处理器
  const defaultBlockquoteRender = md.renderer.rules.blockquote_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  // 修改blockquote的渲染方式
  md.renderer.rules.blockquote_open = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    
    // 如果是callout，添加特殊的类和属性
    if (token.info && token.info.startsWith('callout-')) {
      const calloutType = token.info.replace('callout-', '');
      token.attrJoin('class', 'callout');
      token.attrJoin('class', `callout-${calloutType}`);
      token.attrJoin('class', 'admonition');
      token.attrJoin('class', calloutType);
      
      // 查找标题token并添加特殊的类
      if (idx + 1 < tokens.length && tokens[idx + 1].type === 'callout_title_open') {
        tokens[idx + 1].attrJoin('class', 'callout-title');
        tokens[idx + 1].attrJoin('class', 'admonition-title');
      }
    }
    
    return defaultBlockquoteRender(tokens, idx, options, env, self);
  };

  // 在核心中注册新的规则，处理callout语法
  md.core.ruler.after('block', 'callout', state => {
    const tokens = state.tokens;
    let i = 0;
    
    while (i < tokens.length) {
      // 查找blockquote_open token
      if (tokens[i].type === 'blockquote_open') {
        // 检查blockquote内容的第一行是否匹配callout语法
        let j = i + 1;
        
        // 查找paragraph_open
        while (j < tokens.length && tokens[j].type !== 'paragraph_open') {
          j++;
        }
        
        // 查找内联token
        if (j < tokens.length && tokens[j + 1].type === 'inline') {
          const inlineToken = tokens[j + 1];
          const firstLine = inlineToken.content.split('\n')[0];
          const match = CALLOUT_REGEX.exec(firstLine);
          
          if (match) {
            const calloutType = match[1].toLowerCase();
            const title = match[2] || calloutType.charAt(0).toUpperCase() + calloutType.slice(1);
            
            // 标记这个blockquote为callout
            tokens[i].info = `callout-${calloutType}`;
            
            // 在blockquote_open后插入标题
            const titleOpenToken = new Token('callout_title_open', 'p', 1);
            titleOpenToken.block = true;
            
            const titleContentToken = new Token('inline', '', 0);
            titleContentToken.content = title;
            titleContentToken.children = [];
            
            const titleCloseToken = new Token('callout_title_close', 'p', -1);
            titleCloseToken.block = true;
            
            // 删除原始行中的callout语法
            inlineToken.content = inlineToken.content.replace(CALLOUT_REGEX, '');
            
            // 插入标题token
            tokens.splice(i + 1, 0, titleOpenToken, titleContentToken, titleCloseToken);
            
            // 更新索引
            i += 3;
          }
        }
      }
      
      i++;
    }
    
    return true;
  });
}; 
