import type { PortManager } from '@antv/x6/lib/model/port';
import type { Attr } from '@antv/x6/lib/registry';
import type { Edge } from '@antv/x6';
// 链接桩属性
const portAttrs: Attr.CellAttrs = {
  circle: {
    r: 4,
    magnet: true,
    stroke: '#5F95FF',
    strokeWidth: 1,
    fill: '#fff',
    zIndex: 999,
    // style: {
    //   visibility: 'hidden',
    // },
  },
};
// 链接桩
const ports: Partial<PortManager.Metadata> = {
  groups: {
    top: {
      position: 'top',
      attrs: portAttrs,
    },
    right: {
      position: 'right',
      attrs: portAttrs,
    },
    bottom: {
      position: 'bottom',
      attrs: portAttrs,
    },
    left: {
      position: 'left',
      attrs: portAttrs,
    },
  },
  items: [
    {
      group: 'top',
      id: 'top',
    },
    {
      group: 'right',
      id: 'right',
    },
    {
      group: 'bottom',
      id: 'bottom',
    },
    {
      group: 'left',
      id: 'left',
    },
  ],
};

const edgeAttrs: Attr.CellAttrs = {
  line: {
    stroke: '#8f8f8f',
    strokeWidth: 1,
    // sourceMarker: 'circle',
    // targetMarker: 'block',
    // targetMarker: { // 煎肉
    //   name: 'block',
    //   width: 12,
    //   height: 8,
    // },
  },
};
const labelFontSize = 14;
const addLabelAttr = (edges: Edge.Metadata[]): Edge.Metadata[] => {
  return edges.map((edge) => {
    edge.labels = [
      {
        attrs: {
          text: {
            text: edge.label,
            fontSize: labelFontSize,
          },
        },
        position: {
          options: {
            keepGradient: true,
            ensureLegibility: true,
          },
        },
      },
    ];
    delete edge.label;
    return edge;
  });
};
const addEdgeAttr = (edges: Edge.Metadata[]): Edge.Metadata[] => {
  return edges.map((edge) => {
    edge.attrs = edgeAttrs;
    return edge;
  });
};
const addEdgeTools = (edges: Edge.Metadata[]): Edge.Metadata[] => {
  return edges.map((edge) => {
    const tools = [
      ...(edge.tools || []),
      // {
      //   name: 'button-remove',
      //   args: { distance: 10 },
      // },
      'edge-editor',
    ];
    const _tools = tools.reduce((acc, current) => {
      // 如果当前对象不在累加器数组中，就将其添加到累加器中
      if (!acc.some((item) => item.name === current.name)) {
        acc.push(current);
      }
      return acc;
    }, []);
    edge.tools = _tools;
    return edge;
  });
};

export { ports, edgeAttrs, addLabelAttr, labelFontSize, addEdgeAttr, addEdgeTools };
