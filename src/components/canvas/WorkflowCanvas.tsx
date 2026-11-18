'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import confetti from 'canvas-confetti';

import { CustomWorkflowNode } from './CustomWorkflowNode';
import { NodePalette } from './NodePalette';
import { NodeConfigDrawer } from './NodeConfigDrawer';
import { ExecutionPanel } from './ExecutionPanel';
import { GraphDiagnosticsModal } from './GraphDiagnosticsModal';
import { AICopilotModal } from './AICopilotModal';
import { IntegrationsModal } from './IntegrationsModal';
import { SubscriptionModal } from './SubscriptionModal';
import { TemplatesModal } from './TemplatesModal';
import { TestPayloadModal } from './TestPayloadModal';
import { Navbar } from './Navbar';

import { 
  validateWorkflowGraph, 
  wouldCreateCycle, 
  computeHierarchicalLayout,
  SimpleNode, 
  SimpleEdge 
} from '@/lib/graph-engine';
import { executeWorkflow } from '@/lib/execution-engine';
import { NODE_DEFINITIONS } from '@/lib/node-registry';
import { 
  DEFAULT_WORKFLOW, 
  loadSavedWorkflows, 
  saveWorkflows, 
  loadCredentials, 
  saveCredentials, 
  loadSubscription, 
  saveSubscription, 
  saveExecutionRun 
} from '@/lib/storage';
import { NodeType, WorkflowNodeData, WorkflowRun } from '@/types/workflow';

export function WorkflowCanvas() {
  const nodeTypes = useMemo(() => ({
    custom: CustomWorkflowNode
  }), []);

  const [workflow, setWorkflow] = useState(DEFAULT_WORKFLOW);
  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_WORKFLOW.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEFAULT_WORKFLOW.edges);

  // Modals & Panels State
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isAICopilotOpen, setIsAICopilotOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);

  // Execution & Storage State
  const [isRunning, setIsRunning] = useState(false);
  const [currentRun, setCurrentRun] = useState<WorkflowRun | null>(null);
  const [credentials, setCredentials] = useState(loadCredentials);
  const [subscription, setSubscription] = useState(loadSubscription);
  const [cycleToast, setCycleToast] = useState<string | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const loaded = loadSavedWorkflows();
    if (loaded && loaded.length > 0) {
      setWorkflow(loaded[0]);
      setNodes(loaded[0].nodes);
      setEdges(loaded[0].edges);
    }
  }, [setNodes, setEdges]);

  // Sync to Storage on Edits
  useEffect(() => {
    const updated = {
      ...workflow,
      nodes,
      edges,
      updatedAt: new Date().toISOString()
    };
    saveWorkflows([updated]);
  }, [nodes, edges, workflow]);

  // Graph Validation (Cycle Detection & Topological Ordering)
  const validation = useMemo(() => {
    return validateWorkflowGraph(nodes as SimpleNode[], edges as SimpleEdge[]);
  }, [nodes, edges]);

  // Pre-connection cycle prevention
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      if (!connection.source || !connection.target) return false;
      const willCycle = wouldCreateCycle(
        nodes as SimpleNode[],
        edges as SimpleEdge[],
        { source: connection.source, target: connection.target }
      );
      if (willCycle) {
        setCycleToast('Connection rejected: Would cause an infinite execution loop!');
        setTimeout(() => setCycleToast(null), 3500);
        return false;
      }
      return true;
    },
    [nodes, edges]
  );

  // Edge connection callback
  const onConnect = useCallback(
    (params: Connection) => {
      if (!isValidConnection(params)) return;

      const newEdge: Edge = {
        ...params,
        id: `e_${params.source}_${params.target}_${Date.now()}`,
        animated: true,
        style: { stroke: '#818cf8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' }
      };

      if (params.sourceHandle === 'true') {
        newEdge.label = 'True';
        newEdge.style = { stroke: '#10b981', strokeWidth: 2 };
        newEdge.markerEnd = { type: MarkerType.ArrowClosed, color: '#10b981' };
      } else if (params.sourceHandle === 'false') {
        newEdge.label = 'False';
        newEdge.style = { stroke: '#f59e0b', strokeWidth: 2 };
        newEdge.markerEnd = { type: MarkerType.ArrowClosed, color: '#f59e0b' };
      }

      setEdges(eds => addEdge(newEdge, eds));
    },
    [setEdges, isValidConnection]
  );

  // Node Selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Add new node from palette
  const handleAddNode = useCallback(
    (type: NodeType) => {
      const def = NODE_DEFINITIONS[type];
      const id = `node_${type}_${Math.random().toString(36).substring(2, 6)}`;
      
      const x = 300 + (nodes.length % 4) * 80;
      const y = 150 + (nodes.length % 3) * 80;

      const newNode: Node = {
        id,
        type: 'custom',
        position: { x, y },
        data: {
          label: def.label,
          type,
          category: def.category,
          description: def.description,
          icon: def.icon,
          config: { ...def.defaultConfig },
          status: 'idle'
        }
      };

      setNodes(nds => [...nds, newNode]);
      setSelectedNodeId(id);
    },
    [nodes.length, setNodes]
  );

  // Update node config or label
  const handleUpdateNode = useCallback(
    (nodeId: string, updatedData: Partial<WorkflowNodeData>) => {
      setNodes(nds =>
        nds.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updatedData
              }
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Delete node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes(nds => nds.filter(n => n.id !== nodeId));
      setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [selectedNodeId, setNodes, setEdges]
  );

  // Auto-layout nodes hierarchically
  const handleAutoLayout = useCallback(() => {
    const layoutPositions = computeHierarchicalLayout(
      nodes as SimpleNode[],
      edges as SimpleEdge[]
    );
    setNodes(nds =>
      nds.map(n => ({
        ...n,
        position: layoutPositions[n.id] || n.position
      }))
    );
  }, [nodes, edges, setNodes]);

  // Export workflow to JSON file
  const handleExportWorkflow = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(workflow, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${workflow.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [workflow]);

  // Import workflow from JSON
  const handleImportWorkflow = useCallback((imported: any) => {
    if (imported && imported.nodes && imported.edges) {
      setWorkflow(imported);
      setNodes(imported.nodes);
      setEdges(imported.edges);
      setSelectedNodeId(null);
    }
  }, [setNodes, setEdges]);

  // Execute Workflow (with optional custom payload)
  const handleRunExecution = async (customPayload?: any) => {
    if (isRunning) return;
    setIsRunning(true);
    setIsLogsOpen(true);

    // Reset node statuses
    setNodes(nds =>
      nds.map(n => ({
        ...n,
        data: { ...n.data, status: 'pending', lastExecution: undefined }
      }))
    );

    let initialPayload = customPayload;
    if (!initialPayload) {
      const triggerNode = nodes.find(n => (n.data?.type as string)?.startsWith('trigger_'));
      if (triggerNode?.data?.config?.samplePayload) {
        try {
          initialPayload = JSON.parse(triggerNode.data.config.samplePayload);
        } catch {
          initialPayload = { event: 'manual_trigger' };
        }
      } else {
        initialPayload = {
          event: 'customer.feedback',
          customer: {
            name: 'Sarah Connor',
            email: 'sarah@cyberdyne.io',
            feedback: 'I love Blessing automation! It seamlessly connects our Spotify playlist with Gemini AI.'
          }
        };
      }
    }

    try {
      const runResult = await executeWorkflow(
        workflow.id,
        workflow.name,
        nodes as SimpleNode[],
        edges as SimpleEdge[],
        initialPayload,
        progress => {
          if (progress.nodeId && progress.status) {
            setNodes(nds =>
              nds.map(n => {
                if (n.id === progress.nodeId) {
                  return {
                    ...n,
                    data: {
                      ...n.data,
                      status: progress.status,
                      lastExecution: {
                        durationMs: 240,
                        output: progress.output,
                        error: progress.error
                      }
                    }
                  };
                }
                return n;
              })
            );
          }
          if (progress.run) {
            setCurrentRun(progress.run);
          }
        },
        credentials
      );

      setCurrentRun(runResult);
      saveExecutionRun(runResult);

      // Increment subscription usage
      const newSub = {
        ...subscription,
        runsUsedThisMonth: subscription.runsUsedThisMonth + 1
      };
      setSubscription(newSub);
      saveSubscription(newSub);

      if (runResult.status === 'success') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      console.error('Execution error', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Apply template from AI Copilot or Templates Library
  const handleApplyTemplate = (tpl: any) => {
    setWorkflow(prev => ({
      ...prev,
      name: tpl.name || prev.name,
      description: tpl.description || prev.description
    }));
    setNodes(tpl.nodes);
    setEdges(tpl.edges);
    setSelectedNodeId(null);
  };

  return (
    <div className="relative w-screen h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Navbar
        workflowName={workflow.name}
        onUpdateWorkflowName={name => setWorkflow(w => ({ ...w, name }))}
        isActive={workflow.active}
        onToggleActive={() => setWorkflow(w => ({ ...w, active: !w.active }))}
        onRunTest={() => handleRunExecution()}
        isRunning={isRunning}
        validation={validation}
        onOpenPalette={() => setIsPaletteOpen(prev => !prev)}
        onOpenAICopilot={() => setIsAICopilotOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenIntegrations={() => setIsIntegrationsOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenLogs={() => setIsLogsOpen(prev => !prev)}
        onOpenPayloadModal={() => setIsPayloadModalOpen(true)}
        onAutoLayout={handleAutoLayout}
        onExportWorkflow={handleExportWorkflow}
        onImportWorkflow={handleImportWorkflow}
        subscription={subscription}
      />

      {/* Cycle Detection Rejection Toast */}
      {cycleToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-150">
          <span>{cycleToast}</span>
        </div>
      )}

      {/* Main Graph Canvas */}
      <div className="relative flex-1 w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2.0}
          className="bg-zinc-950"
        >
          <Background color="#27272a" gap={20} size={1.2} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-zinc-900 !border-zinc-800 !text-zinc-200 fill-zinc-200 rounded-xl overflow-hidden shadow-2xl" />
          <MiniMap
            nodeStrokeColor="#4f46e5"
            nodeColor="#18181b"
            maskColor="rgba(9, 9, 11, 0.75)"
            className="!bg-zinc-900/90 !border-zinc-800 rounded-xl overflow-hidden shadow-2xl"
          />
        </ReactFlow>

        {/* Node Palette Drawer */}
        <NodePalette
          isOpen={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          onAddNode={handleAddNode}
        />

        {/* Node Config Drawer */}
        <NodeConfigDrawer
          selectedNode={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          allNodes={nodes}
        />

        {/* Live Execution Console & Logs */}
        <ExecutionPanel
          isOpen={isLogsOpen}
          onClose={() => setIsLogsOpen(false)}
          currentRun={currentRun}
          onReplayRun={() => handleRunExecution()}
        />

        {/* Graph Diagnostics & Loop Analysis Modal */}
        <GraphDiagnosticsModal
          isOpen={isDiagnosticsOpen}
          onClose={() => setIsDiagnosticsOpen(false)}
          validation={validation}
          nodesCount={nodes.length}
          edgesCount={edges.length}
        />

        {/* AI Copilot Prompt-to-Workflow Modal */}
        <AICopilotModal
          isOpen={isAICopilotOpen}
          onClose={() => setIsAICopilotOpen(false)}
          onApplyGeneratedWorkflow={handleApplyTemplate}
        />

        {/* Third-Party Integrations Hub */}
        <IntegrationsModal
          isOpen={isIntegrationsOpen}
          onClose={() => setIsIntegrationsOpen(false)}
          credentials={credentials}
          onUpdateCredential={cred => {
            const updated = credentials.map(c => (c.id === cred.id ? cred : c));
            setCredentials(updated);
            saveCredentials(updated);
          }}
        />

        {/* Subscription & Plans Management Modal */}
        <SubscriptionModal
          isOpen={isSubscriptionOpen}
          onClose={() => setIsSubscriptionOpen(false)}
          subscription={subscription}
          onUpdateSubscription={updated => {
            setSubscription(updated);
            saveSubscription(updated);
          }}
        />

        {/* Templates Library Modal */}
        <TemplatesModal
          isOpen={isTemplatesOpen}
          onClose={() => setIsTemplatesOpen(false)}
          onSelectTemplate={handleApplyTemplate}
        />

        {/* Test Payload Simulator Modal */}
        <TestPayloadModal
          isOpen={isPayloadModalOpen}
          onClose={() => setIsPayloadModalOpen(false)}
          onRun={handleRunExecution}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
}
