import React from 'react';
import { createRoot } from 'react-dom/client';
import { Graph, Model, Shape, Node, Edge, Markup } from '@antv/x6';
import { GridLayout, MDSLayout, RandomLayout, DagreLayout } from '@antv/layout';

import { Stencil } from '@antv/x6-plugin-stencil';
import { Transform } from '@antv/x6-plugin-transform';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { History } from '@antv/x6-plugin-history';
import { Scroller } from '@antv/x6-plugin-scroller';
import { ports, edgeAttrs, labelFontSize } from './setting';
import Label from './edge-label';
import './index.scss';
import { data } from './data';
class App extends React.Component {
  private container: HTMLDivElement;
  graph: Graph;
  stencil: HTMLDivElement;
  customNode = () => {
    Graph.registerEdge('custom-edge', {
      line: {
        stroke: '#eeeeee',
        strokeWidth: 1,
        // sourceMarker: 'circle',
        // targetMarker: 'block',
        // targetMarker: { // 煎肉
        //   name: 'block',
        //   width: 12,
        //   height: 8,
        // },
      },
      attrs: {
        label: {
          textWrap: {
            width: 20,
            ellipsis: true,
          },
        },
      },
    });
    Graph.registerNode(
      'custom-rect',
      {
        inherit: 'rect',
        width: 66,
        height: 36,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: '#5F95FF',
            fill: '#EFF4FF',
          },
          text: {
            fontSize: 12,
            fill: '#262626',
          },
          label: {
            textWrap: {
              width: -10, // 宽度减少 10px
              // height: '80%', // 高度为参照元素高度的一半
              ellipsis: true, // 文本超出显示范围时，自动添加省略号
              breakWord: true, // 是否截断单词
            },
          },
        },
        ports: { ...ports },
      },
      true,
    );

    Graph.registerNode(
      'custom-polygon',
      {
        inherit: 'polygon',
        width: 66,
        height: 36,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: '#5F95FF',
            fill: '#EFF4FF',
          },
          text: {
            fontSize: 12,
            fill: '#262626',
          },
        },
        ports: {
          ...ports,
          items: [
            {
              group: 'top',
            },
            {
              group: 'bottom',
            },
          ],
        },
      },
      true,
    );

    Graph.registerNode(
      'custom-circle',
      {
        inherit: 'circle',
        width: 45,
        height: 45,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: '#5F95FF',
            fill: '#EFF4FF',
          },
          text: {
            fontSize: 12,
            fill: '#262626',
          },
        },
        ports: { ...ports },
      },
      true,
    );

    Graph.registerNode(
      'custom-image',
      {
        inherit: 'rect',
        width: 52,
        height: 52,
        markup: [
          {
            tagName: 'rect',
            selector: 'body',
          },
          {
            tagName: 'image',
          },
          {
            tagName: 'text',
            selector: 'label',
          },
        ],
        attrs: {
          body: {
            stroke: '#5F95FF',
            fill: '#5F95FF',
          },
          image: {
            width: 26,
            height: 26,
            refX: 13,
            refY: 16,
          },
          label: {
            refX: 3,
            refY: 2,
            textAnchor: 'left',
            textVerticalAnchor: 'top',
            fontSize: 12,
            fill: '#fff',
          },
        },
        ports: { ...ports },
      },
      true,
    );
  };
  bindKeyboard = () => {
    // #region 快捷键与事件
    this.graph.bindKey(['meta+c', 'ctrl+c'], () => {
      const cells = this.graph.getSelectedCells();
      if (cells.length) {
        this.graph.copy(cells);
      }
      return false;
    });
    this.graph.bindKey(['meta+x', 'ctrl+x'], () => {
      const cells = this.graph.getSelectedCells();
      if (cells.length) {
        this.graph.cut(cells);
      }
      return false;
    });
    this.graph.bindKey(['meta+v', 'ctrl+v'], () => {
      if (!this.graph.isClipboardEmpty()) {
        const cells = this.graph.paste({ offset: 32 });
        this.graph.cleanSelection();
        this.graph.select(cells);
      }
      return false;
    });

    // undo redo
    this.graph.bindKey(['meta+z', 'ctrl+z'], () => {
      if (this.graph.canUndo()) {
        this.graph.undo();
      }
      return false;
    });
    this.graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
      if (this.graph.canRedo()) {
        this.graph.redo();
      }
      return false;
    });

    // select all
    this.graph.bindKey(['meta+a', 'ctrl+a'], () => {
      const nodes = this.graph.getNodes();
      if (nodes) {
        this.graph.select(nodes);
      }
    });

    // delete
    this.graph.bindKey('backspace', () => {
      const cells = this.graph.getSelectedCells();
      if (cells.length) {
        this.graph.removeCells(cells);
      }
    });

    // zoom
    this.graph.bindKey(['ctrl+1', 'meta+1'], () => {
      const zoom = this.graph.zoom();
      if (zoom < 1.5) {
        this.graph.zoom(0.1);
      }
    });
    this.graph.bindKey(['ctrl+2', 'meta+2'], () => {
      const zoom = this.graph.zoom();
      if (zoom > 0.5) {
        this.graph.zoom(-0.1);
      }
    });
  };
  showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
    for (let i = 0, len = ports.length; i < len; i += 1) {
      ports[i].style.visibility = show ? 'visible' : 'hidden';
    }
  };
  setStencil = () => {
    this.customNode();
    const stencil = new Stencil({
      title: '流程图',
      target: this.graph,
      stencilGraphWidth: 200,
      stencilGraphHeight: 180,
      collapsable: true,
      groups: [
        {
          title: '基础流程图',
          name: 'group1',
        },
        {
          title: '系统设计图',
          name: 'group2',
          graphHeight: 250,
          layoutOptions: {
            rowHeight: 70,
          },
        },
      ],
      layoutOptions: {
        columns: 2,
        columnWidth: 80,
        rowHeight: 55,
      },
    });
    this.stencil.appendChild(stencil.container);

    const r1 = this.graph.createNode({
      shape: 'custom-rect',
      label: '开始',
      attrs: {
        body: {
          rx: 20,
          ry: 26,
        },
      },
    });
    const r2 = this.graph.createNode({
      shape: 'custom-rect',
      label: '过程',
    });
    const r3 = this.graph.createNode({
      shape: 'custom-rect',
      attrs: {
        body: {
          rx: 6,
          ry: 6,
        },
      },
      label: '可选过程',
    });
    const r4 = this.graph.createNode({
      shape: 'custom-polygon',
      attrs: {
        body: {
          refPoints: '0,10 10,0 20,10 10,20',
        },
      },
      label: '决策',
    });
    const r5 = this.graph.createNode({
      shape: 'custom-polygon',
      attrs: {
        body: {
          refPoints: '10,0 40,0 30,20 0,20',
        },
      },
      label: '数据',
    });
    const r6 = this.graph.createNode({
      shape: 'custom-circle',
      label: '连接',
    });
    stencil.load([r1, r2, r3, r4, r5, r6], 'group1');
    const imageShapes = [
      {
        label: 'Client',
        image: 'https://gw.alipayobjects.com/zos/bmw-prod/687b6cb9-4b97-42a6-96d0-34b3099133ac.svg',
      },
      {
        label: 'Http',
        image: 'https://gw.alipayobjects.com/zos/bmw-prod/dc1ced06-417d-466f-927b-b4a4d3265791.svg',
      },
      {
        label: 'Api',
        image: 'https://gw.alipayobjects.com/zos/bmw-prod/c55d7ae1-8d20-4585-bd8f-ca23653a4489.svg',
      },
      {
        label: 'Sql',
        image: 'https://gw.alipayobjects.com/zos/bmw-prod/6eb71764-18ed-4149-b868-53ad1542c405.svg',
      },
      {
        label: 'Clound',
        image: 'https://gw.alipayobjects.com/zos/bmw-prod/c36fe7cb-dc24-4854-aeb5-88d8dc36d52e.svg',
      },
      {
        label: 'Mq',
        image: 'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
      },
    ];
    const imageNodes = imageShapes.map((item) =>
      this.graph.createNode({
        shape: 'custom-image',
        label: item.label,
        attrs: {
          image: {
            'xlink:href': item.image,
          },
        },
      }),
    );
    stencil.load(imageNodes, 'group2');
  };

  componentDidMount() {
    const graph = new Graph({
      container: this.container,
      grid: true,
      background: {
        color: '#F2F7FA',
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
      connecting: {
        router: 'normal',
        connector: {
          name: 'rounded',
          args: {
            radius: 90,
          },
        },
        anchor: 'center',
        connectionPoint: 'rect',
        snap: true,
        allowBlank: false,
        // allowLoop: false,
        // highlight: true,
        // snap: {
        //   radius: 20,
        // },
        createEdge() {
          return new Shape.Edge({
            attrs: edgeAttrs,
            zIndex: 0,
          });
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet;
        },
      },
      // onEdgeLabelRendered: (args) => {
      //   const { selectors, edge } = args;

      //   // const targetCell = edge.getTargetCell();
      //   // const sourceCell = edge.getSourceCell();
      //   // const label = edge.getLabelAt(0);
      //   // if (!targetCell || !sourceCell || !label) {
      //   //   return;
      //   // }
      //   // const { position: tP, size: tS } = targetCell.getProp(); // 节点上所有的信息都可以拿到
      //   // const { position: sP, size: sS } = sourceCell.getProp(); // 节点上所有的信息都可以拿到
      //   // const source = edge.getSource();
      //   // const target = edge.getTarget();
      //   // const tPX = target.port === 'right' ? tP.x + tS.width : tP.x;
      //   // const tPY = target.port === 'bottom' ? tP.y + tS.height : tP.y;
      //   // const sPX = source.port === 'right' ? sP.x + sS.width : sP.x;
      //   // const sPY = source.port === 'bottom' ? sP.y + sS.height : sP.y;
      //   // const xPow = Math.pow(Math.abs(tPX - sPX), 2);
      //   // const yPow = Math.pow(Math.abs(tPY - sPY), 2);
      //   // const length = Math.floor(Math.sqrt(yPow + xPow));
      //   // const text = (label?.attrs?.text.text as string) || '';
      //   // const remainTextNum = Math.floor((length - 20) / 14) - 1;
      //   // if (/CMP/.test(text)) {
      //   //   debugger;
      //   // }
      //   // label.attrs!.text.text = text.slice(0, remainTextNum);
      //   // label.position = {
      //   //   options: {
      //   //     keepGradient: true,
      //   //     ensureLegibility: true,
      //   //   },
      //   // };

      //   // const content = selectors.foContent as HTMLDivElement;
      //   // if (content) {
      //   //   const root = createRoot(content);
      //   //   root.render(<Label />);
      //   // }
      //   return undefined;
      // },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#5F95FF',
              stroke: '#5F95FF',
            },
          },
        },
      },
    });
    // #region 使用插件
    graph
      .use(
        new Transform({
          resizing: true,
          rotating: true,
        }),
      )
      .use(
        new Selection({
          rubberband: true,
          showNodeSelectionBox: true,
          multiple: true,
          rubberEdge: true,
          rubberNode: true,
          modifiers: 'shift',
        }),
      )
      .use(new Snapline())
      .use(new Keyboard())
      .use(new Clipboard())
      .use(new History())
      .use(
        new Scroller({
          enabled: true,
        }),
      );
    this.graph = graph;
    // const source = graph.addNode({
    //   id: '1',
    //   x: 40,
    //   y: 40,
    //   width: 100,
    //   height: 40,
    //   label: 'source',
    //   attrs: {
    //     body: {
    //       stroke: '#8f8f8f',
    //       strokeWidth: 1,
    //       fill: '#fff',
    //       rx: 6,
    //       ry: 6,
    //     },
    //     label: {
    //       textWrap: {
    //         text: 'sdfsdlfjlj',
    //         width: 20,
    //         ellipse: true,
    //       },
    //     },
    //   },
    //   tools: [
    //     {
    //       name: 'button-remove',
    //       args: {
    //         x: '100%',
    //         y: 0,
    //         offset: { x: -10, y: 10 },
    //       },
    //     },
    //     'node-editor',
    //   ],
    //   ports,
    // });

    // const target = graph.addNode({
    //   id: '2',
    //   x: 120,
    //   y: 160,
    //   width: 100,
    //   height: 40,
    //   label: 'target',
    //   attrs: {
    //     body: {
    //       stroke: '#8f8f8f',
    //       strokeWidth: 1,
    //       fill: '#fff',
    //       rx: 6,
    //       ry: 6,
    //     },
    //   },
    //   tools: ['node-editor'],
    //   ports,
    // });

    // const _edge = graph.addEdge({
    //   source: { cell: '1' },
    //   target: { cell: '2' },
    //   sourcePort: 'bottom',
    //   targetPort: 'bottom',
    //   labels: [
    //     {
    //       attrs: {
    //         text: {
    //           text: 'First',
    //         },
    //       },
    //       position: {
    //         options: {
    //           keepGradient: true,
    //           ensureLegibility: true,
    //         },
    //       },
    //     },
    //   ],
    //   // defaultLabel: {
    //   //   attrs: {
    //   //     textWrap: {
    //   //       text: 'sdfsdlfjlj',
    //   //       width: 20,
    //   //       ellipse: true,
    //   //     },
    //   //   },
    //   // },
    //   // defaultLabel: {
    //   //   markup: Markup.getForeignObjectMarkup(),
    //   //   attrs: {
    //   //     fo: {
    //   //       width: 120,
    //   //       height: 30,
    //   //       x: 0,
    //   //       y: 0,
    //   //     },
    //   //   },
    //   // },
    //   attrs: {
    //     text: {
    //       text: 'First',
    //     },
    //     line: {
    //       stroke: '#8f8f8f',
    //       strokeWidth: 1,
    //       color: 'rgb(95, 149, 255)',
    //     },
    //   },
    //   tools: ['edge-editor'],
    // });
    /*** edge工具-start ****/
    graph.on('edge:mouseenter', (params) => {
      const { edge } = params;
      edge.addTools({
        name: 'button-remove',
        // args: {
        //   x: 0,
        //   y: 0,
        //   offset: { x: 10, y: 10 },
        // },
        args: { distance: 20 },
      });
    });

    graph.on('edge:mouseleave', (params) => {
      const { edge } = params;
      edge.removeTool('button-remove');
    });
    /*** edge工具-end ****/

    /*** node工具-start **/
    graph.on('node:mouseenter', () => {
      // 显示链接桩
      const ports = this.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
      this.showPorts(ports, true);
    });
    graph.on('node:mouseleave', () => {
      // 隐藏链接桩
      const ports = this.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
      this.showPorts(ports, false);
    });
    /*** node工具-start **/

    this.setStencil();
    this.bindKeyboard();
    const gridLayout = new GridLayout({
      type: 'grid',
      preventOverlap: true,
      condense: false,
      width: 1000,
      height: 1000,
      // nodeSize: 20,
      // rows: 5,
      cols: 4,
      // cols: 1,
      sortBy: 'id',
      // begin: [1, 20],
    });
    const _data = gridLayout.layout(data);
    debugger;
    const __data = this.adjustConnectionPort(_data);
    this.adjustEdgeLabel(__data);
    this.graph.fromJSON(__data);
  }

  /**
   * 调整连接点
   *
   * @param {{ nodes: Node.Metadata[]; edges: Edge.Metadata[] }} data
   * @memberof App
   */
  adjustConnectionPort = (data: { nodes: Node.Metadata[]; edges: Edge.Metadata[] }) => {
    const { nodes, edges } = data;
    edges.forEach((edge) => {
      const { source, target } = edge;
      const sourceId = source?.cell || source;
      const targetId = target?.cell || target;
      const sourceNode = nodes.find((node) => node.id === sourceId);
      const targetNode = nodes.find((node) => node.id === targetId);
      if (
        !sourceNode ||
        sourceNode.x === undefined ||
        sourceNode.y === undefined ||
        !targetNode ||
        targetNode.x === undefined ||
        targetNode.y === undefined
      ) {
        return;
      }
      const { x: sX, y: sY, height: sH = 40, width: sW = 80 } = sourceNode;
      const { x: tX, y: tY, height: tH = 40, width: tW = 80 } = targetNode;
      const _sX = Math.round(sX);
      const _sY = Math.round(sY);
      const _tX = Math.round(tX);
      const _tY = Math.round(tY);
      if (_tX === _sX) {
        // 同一水平线上的
        edge.sourcePort = _tY > _sY ? 'bottom' : 'top';
        edge.targetPort = _tY > _sY ? 'top' : 'bottom';
      } else if (_sY === _tY) {
        // 同一垂直线上的
        edge.sourcePort = _tX > _sX ? 'right' : 'left';
        edge.targetPort = _tX > _sX ? 'left' : 'right';
      } else {
        const distanceY = Math.abs(_tY - _sY);
        const distanceX = Math.abs(_tX - _sX);
        if (distanceY >= distanceX) {
          // 竖直方向的间距最大
          edge.targetPort = _tY > _sY ? 'top' : 'bottom';
          edge.sourcePort = _tY > _tX ? 'right' : 'left';
        } else {
          edge.sourcePort = _tY > _sY ? 'left' : 'right';
          edge.targetPort = _tX > _sX ? 'bottom' : 'top';
        }
      }
    });
    return data;
  };
  adjustEdgeLabel = (data: { nodes: Node.Metadata[]; edges: Edge.Metadata[] }) => {
    const { nodes, edges } = data;
    edges.forEach((edge) => {
      const { source, target, labels, sourcePort: sPort, targetPort: tPort } = edge;
      if (!source || !target || !labels) {
        return;
      }
      const sCell = source?.cell || source;
      const tCell = target?.cell || target;
      // const { cell: sCell } = source;
      // const { cell: tCell } = target;

      const _source = nodes.find((node) => node.id === sCell);
      const _target = nodes.find((node) => node.id === tCell);
      if (!_source || !_target) {
        return;
      }
      const { width: sW, height: sH, x: sX, y: sY } = _source;
      const { width: tW, height: tH, x: tX, y: tY } = _target;
      const tPX = tPort === 'right' ? tX! + tW! : tX!;
      const tPY = tPort === 'bottom' ? tY! + tH! : tY!;
      const sPX = sPort === 'right' ? sX! + sW! : sX!;
      const sPY = sPort === 'bottom' ? sY! + sH! : sY!;
      const xPow = Math.pow(Math.abs(tPX - sPX), 2);
      const yPow = Math.pow(Math.abs(tPY - sPY), 2);
      const length = Math.floor(Math.sqrt(yPow + xPow));
      const label = labels[0];
      const text = (label?.attrs?.text.text as string) || '';
      const remainTextNum = Math.floor((length - 20) / 14) - 1;
      label.attrs!.text.originText = text;
      label.attrs!.text.text = text.slice(0, remainTextNum) + (text.length > remainTextNum ? '...' : '');
    });
  };
  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };
  refStencil = (stencil: HTMLDivElement) => {
    this.stencil = stencil;
  };
  getModel = () => {
    const nodes = this.graph.getNodes().map((node) => {
      debugger;
      return {
        id: node.id,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        label: node.label, // 类型上没有
        // position: { x: node.position().x, y: node.position().y },
        size: { width: node.size().width, height: node.size().height },
        attrs: node.attr(),
        ports: { ...ports },
      };
    });
    const edges = this.graph.getEdges().map((edge) => {
      debugger;
      return {
        source: edge.source.cell,
        target: edge.target,
        attrs: edge.attr(),
      };
    });
    return {
      nodes,
      edges,
    };
  };
  add = () => {
    // const gridLayout = new GridLayout({
    //   type: 'grid',
    //   // preventOverlap: true,
    //   // width: 800,
    //   // height: 520,
    //   // preventOverlapPadding: 100,
    //   // rows: 10,
    //   // cols: 1,
    //   // sortBy: 'id',
    // });

    // this.graph.addNode({
    //   x: 220,
    //   y: 260,
    //   width: 100,
    //   height: 40,
    //   label: 'addNode',
    //   attrs: {
    //     body: {
    //       stroke: '#8f8f8f',
    //       strokeWidth: 1,
    //       fill: '#fff',
    //       rx: 6,
    //       ry: 6,
    //     },
    //   },
    // });

    // const as = this.getModel();
    // const a = gridLayout.layout(as);
    // this.graph.fromJSON(a);
    // debugger;
    const ad = this.graph.toJSON();
    debugger;
  };
  render() {
    return (
      <>
        <div className="button-remove-tool-app">
          <div className="stencil-box" ref={this.refStencil}></div>
          <div className="app-content" ref={this.refContainer} />
        </div>
        <div onClick={this.add}>add-node</div>
      </>
    );
  }
}
export default App;
