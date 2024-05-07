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
          label: {
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

      {
        name: 'edge-editor',
        args: {
          getText: (params) => {
            const { cell } = params;
            const labels = cell.store.data.labels;
            const label = labels[0];
            return label.attrs!.label.originText;
          },
          setText: (params) => {
            const { cell, value } = params;
            if (!value) {
              return '';
            }
            const {
              position: { x: sX, y: sY },
              size: { width: sW, height: sH },
            } = cell.getSourceCell().store.data;
            const {
              position: { x: tX, y: tY },
              size: { width: tW, height: tH },
            } = cell.getTargetCell().store.data;
            const sPort = cell.store.data.source?.port || cell.store.data.sourcePort;
            const tPort = cell.store.data.target?.port || cell.store.data.targetPort;
            const labels = cell.store.data.labels;
            const tPX = tPort === 'right' ? tX! + tW! : tX!;
            const tPY = tPort === 'bottom' ? tY! + tH! : tY!;
            const sPX = sPort === 'right' ? sX! + sW! : sX!;
            const sPY = sPort === 'bottom' ? sY! + sH! : sY!;
            const xPow = Math.pow(Math.abs(tPX - sPX), 2);
            const yPow = Math.pow(Math.abs(tPY - sPY), 2);
            const length = Math.floor(Math.sqrt(yPow + xPow));
            const label = labels[0];
            const text = (label?.attrs?.label.text as string) || '';
            const remainTextNum = Math.floor((length - 20) / labelFontSize) - 1;
            label.attrs!.label.originText = value; // to sure: 目前看是可以这样设置的
            label.attrs!.label.text = value.slice(0, remainTextNum) + (text.length > remainTextNum ? '...' : '');
            return label.attrs!.label.text;
          },
        },
      },
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
