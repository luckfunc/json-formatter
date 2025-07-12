import { react } from 'eslint-config-ali';

export default [
  ...react,
  {
    rules: {
      // 将空行限制为一行
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      // --- 新增或修改以下规则来处理 JSX 标签内的空格 ---
      'react/jsx-tag-spacing': [
        'error',
        {
          closingSlash: 'never', // 不允许在自闭合标签的斜杠前有空格 (<img /> 而不是 <img /> )
          beforeSelfClosing: 'always', // 自闭合标签的斜杠前必须有空格 (<img /> 而不是 <img/>)
          afterOpening: 'never', // 开标签 > 之前不允许有空格 (<p> 而不是 <p >)
          beforeClosing: 'never', // 闭合标签 < 之前不允许有空格 (</p> 而不是 < /p>)
        },
      ],
    },
  },
];
