import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const content=read('src/content.js');
const context={window:{}};
vm.runInNewContext(content,context);
const data=context.window.HANDBOOK;
if(data.chapters.length!==15)throw new Error('需要 14 章及附录 A');
if(new Set(data.chapters.map(c=>c.id)).size!==15)throw new Error('章节 ID 重复');
for(const c of data.chapters){
  for(const id of c.related)if(!data.chapters.some(x=>x.id===id))throw new Error('无效章节链接：'+id);
  for(const id of c.sources)if(!data.sources.some(s=>s.id===id))throw new Error('无效来源：'+id);
  if(c.quiz.length!==2)throw new Error('每章应有两道自测题');
  for(const q of c.quiz)if(!q.options[q.correct])throw new Error('无效自测答案');
}
const html=read('src/shell.html')
  .replace('/* STYLES */',()=>read('src/style.css'))
  .replace('/* CONTENT */',()=>content.replace(/<\/script/gi,'<\\/script'))
  .replace('/* APP */',()=>read('src/app.js').replace(/<\/script/gi,'<\\/script'));
fs.writeFileSync(path.join(root,'HANDBOOK.html'),html);
let md=`# 实现领域驱动设计 · 学习手册\n\n基于 Vaughn Vernon 红皮书章节结构的原创导学，${data.date}。\n\n交互入口：[HANDBOOK.html](HANDBOOK.html)。\n\n## 资料范围\n\n已核对出版社目录、公开样章、作者聚合设计文章及部分配套代码。未取得全书全文，不声称完成逐页精读。知行案例、讲解、练习与 Java 21 代码为原创；工程补充与原书主题区分标注。\n\n## 学习路线\n\n第一次按章阅读核心判断与三条要点（建议约 65 分钟）；第二次展开推演与代码；第三次做实验并迁移到自己的业务。\n\n`;
for(const c of data.chapters){
  md+=`## ${c.n} · ${c.title}\n\n*${c.en} · 英文版起始页 ${c.page} · 建议速读 ${c.minutes} 分钟*\n\n### ${c.question}\n\n${c.lead}\n\n`;
  md+=c.points.map(([t,p])=>`- **${t}**：${p}`).join('\n')+'\n\n';
  md+=`### 本章主题\n\n${c.topics.join('；')}。\n\n### 深入推演\n\n${c.deeper.join('\n\n')}\n\n`;
  md+=`### 知行案例\n\n${c.example.story}\n\n**本例选择：**${c.example.decision}\n\n**取舍：**${c.example.tradeoff}\n\n`;
  md+=`示例：${c.example.lang}。代码片段并非全部可以独立编译，完整可运行模型见 examples/ReviewExample.java。\n\n\`\`\`text\n${c.example.code}\n\`\`\`\n\n`;
  md+=`### 误读辨析\n\n${c.traps.map(t=>'- '+t).join('\n')}\n\n### 设计练习\n\n${c.task}\n\n**参考推理：**${c.answer}\n\n### 自测\n\n`;
  c.quiz.forEach((q,i)=>{md+=`${i+1}. ${q.q}\n\n${q.options.map((o,j)=>`   - ${'ABC'[j]}：${o}`).join('\n')}\n\n   **答案：${'ABC'[q.correct]}。** ${q.why}\n\n`;});
  md+='章节定位与延伸：'+c.sources.map(id=>{const s=data.sources.find(x=>x.id===id);return `[${s.name}](${s.url})`;}).join('；')+'。\n\n';
}
md+='## 术语速查\n\n'+data.glossary.map(([cn,en,desc])=>`- **${cn}（${en}）**：${desc}`).join('\n')+'\n\n';
md+='## 资料与范围\n\n'+data.sources.map(s=>`- [${s.name}](${s.url})：${s.scope}`).join('\n')+'\n';
fs.writeFileSync(path.join(root,'HANDBOOK.md'),md);
fs.writeFileSync(path.join(root,'qa/content-manifest.json'),JSON.stringify({builtAt:new Date().toISOString(),chapters:data.chapters.map(c=>({id:c.id,title:c.title,questions:c.quiz.length})),sources:data.sources.length,htmlBytes:Buffer.byteLength(html)},null,2));
console.log(`已生成 HANDBOOK.html / HANDBOOK.md；${data.chapters.length} 单元，30 道自测，${Buffer.byteLength(html)} 字节 HTML。`);
