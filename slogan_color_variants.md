# Slogan配色方案参考

## 🎨 方案A：标准配色 (已实现)
- "Ask Smarter" → `text-emerald-500` (Emerald-500, #10B981)
- "Create Faster" → `text-cyan-500` (Cyan-500, #06B6D4)
- 分隔符 → `text-textSecondary` (灰色圆点)

## 🌟 方案B：明亮配色 (可选)
```jsx
<span className="text-emerald-400 font-semibold">Ask Smarter</span>
<span className="text-cyan-400 font-semibold">Create Faster</span>
```

## 🔥 方案C：渐变效果 (高级)
```jsx
<span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent font-semibold">Ask Smarter</span>
<span className="bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent font-semibold">Create Faster</span>
```

## ⚡ 方案D：单色深浅 (简洁)
```jsx
<span className="text-emerald-600 font-medium">Ask Smarter</span>
<span className="text-emerald-400 font-medium">Create Faster</span>
```

## 🚀 方案E：品牌一致 (与primary色调协调)
```jsx
<span className="text-emerald-500 font-medium">Ask Smarter</span>
<span className="text-indigo-400 font-medium">Create Faster</span>
```

## 💡 方案F：强调重点 (突出关键动词)
```jsx
<span className="text-emerald-500">Ask <span className="text-textSecondary">Smarter</span></span>
<span className="text-cyan-500">Create <span className="text-textSecondary">Faster</span></span>
```