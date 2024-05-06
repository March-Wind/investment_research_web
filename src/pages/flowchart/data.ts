import { Graph, Shape } from '@antv/x6';
import { edgeAttrs, addLabelAttr, addEdgeAttr, addEdgeTools } from './setting';

const connecting = {
  router: 'normal',
  connector: {
    name: 'jumpover',
    args: {
      radius: 90,
    },
  },
  anchor: 'center',
  connectionPoint: 'rect',
  snap: true,
  allowBlank: false,
  allowLoop: false,
  highlight: true,
  // snap: {
  //   radius: 20,
  // },
  createEdge() {
    return new Shape.Edge({
      attrs: {
        line: {
          stroke: '#A2B1C3',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8,
          },
        },
      },
      zIndex: 0,
    });
  },
  validateConnection({ targetMagnet }) {
    return !!targetMagnet;
  },
};

const ports = {
  groups: {
    top: {
      position: { name: 'top' },
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    right: {
      position: { name: 'right' },
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
    bottom: {
      position: { name: 'bottom' },
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
      args: { x: 50, y: 50, angle: 90 },
    },
    left: {
      position: { name: 'left' },
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 1,
          fill: '#fff',
          style: {
            visibility: 'hidden',
          },
        },
      },
    },
  },
  items: [
    {
      group: 'top',
    },
    {
      group: 'right',
    },
    {
      group: 'bottom',
    },
    {
      group: 'left',
    },
  ],
};
const data = {
  nodes: [
    {
      id: '1',
      shape: 'custom-rect',
      label: '设计与模拟',
      description: '利用集成电路设计原理设计芯片布局和功能模拟。',
      width: 100,
      height: 40,
      magnet: true,
      ports,
    },
    {
      id: '2',
      label: '材料准备',
      description: '选择合适的半导体材料，常用的是硅。',
      width: 100,
      height: 40,
      shape: 'custom-rect',
      ports,
    },
    {
      id: '3',
      label: '光刻',
      description: '利用光刻技术在半导体表面形成所需图案。',
      width: 100,
      height: 40,
      shape: 'custom-rect',
    },
    {
      id: '4',
      label: '蚀刻',
      shape: 'custom-rect',
      description: '采用湿法或干法蚀刻技术去除多余的材料，形成电路图案。',
      width: 100,
      height: 40,
    },
    {
      id: '5',
      label: '掺杂',
      shape: 'custom-rect',
      description: '通过离子注入或扩散的方式在半导体材料中引入杂质，改变其电学性质。',
      width: 100,
      height: 40,
    },
    {
      id: '6',
      label: '沉积',
      shape: 'custom-rect',
      description: '使用化学气相沉积（CVD）、物理气相沉积（PVD）等技术在芯片表面沉积绝缘层和金属层。',
      width: 100,
      height: 40,
    },
    {
      id: '7',
      label: '化学机械抛光（CMP）',
      description: '对芯片表面进行平整，以确保光刻过程的精确性。',
      shape: 'custom-rect',
      width: 100,
      height: 40,
    },
    {
      id: '8',
      label: '检测与测试',
      description: '通过电学测试和故障分析确保芯片的功能符合设计规范。',
      width: 100,
      height: 40,
      shape: 'custom-rect',
    },
    {
      id: '9',
      label: '封装',
      shape: 'custom-rect',
      description: '将测试合格的芯片进行封装，保证其在实际应用中的物理保护和电连接。',
      width: 100,
      height: 40,
    },
    {
      id: '10',
      label: '最终测试',
      shape: 'custom-rect',
      description: '对封装后的芯片进行最终性能测试，确保质量控制。',
      width: 100,
      height: 40,
    },
  ],

  edges: [
    {
      source: { cell: '1' },
      target: { cell: '2' },
      shape: 'custom-edge',
      // sourcePort: 'right', // connect to the 'top' anchor point on node1
      // targetPort: 'bottom',
      label: '过度',
      tools: [
        {
          name: 'button-remove',
          args: { distance: 20 },
        },
        // 'source-arrowhead',
        // {
        //   name: 'target-arrowhead',
        //   args: {
        //     attrs: {
        //       fill: 'red',
        //     },
        //   },
        // },
      ],
    },
    {
      source: '2',
      target: '3',
      label: '材料准备完毕->开始光刻',
      connecting,
      tools: [
        {
          name: 'button-remove',
          args: { distance: 20 },
        },
      ],
    },
    {
      source: '3',
      target: '4',
      label: '光刻完成->进行蚀刻',
    },
    {
      source: '4',
      target: '5',
      label: '蚀刻完成->开始掺杂',
    },
    {
      source: '5',
      target: '6',
      label: '掺杂完成->进行沉积',
    },
    {
      source: '6',
      target: '7',
      label: '沉积完成->化学机械抛光',
    },
    {
      source: '7',
      target: '8',
      label: 'CMP完成->检测与测试',
    },
    {
      source: '8',
      target: '9',
      label: '测试通过->进行封装',
    },
    {
      source: '9',
      target: '10',
      label: '封装完成->最终测试',
    },
  ],
};
addLabelAttr(data.edges);
addEdgeAttr(data.edges);
addEdgeTools(data.edges);
export { data };
