import { GraphValidationResult, GraphValidationError } from '@/types/workflow';

export interface SimpleEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface SimpleNode {
  id: string;
  type?: string;
  data?: any;
}

/**
 * Validates a workflow graph:
 * - Cycle Detection (Tarjan's / DFS loop detection)
 * - Topological Ordering (Kahn's Algorithm)
 * - Disconnected and Orphan Node Analysis
 * - Trigger Validation
 */
export function validateWorkflowGraph(
  nodes: SimpleNode[],
  edges: SimpleEdge[]
): GraphValidationResult {
  const errors: GraphValidationError[] = [];
  const warnings: string[] = [];

  const nodeMap = new Map<string, SimpleNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Build Adjacency List & Indegree Map
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();

  nodes.forEach(n => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
    outDegree.set(n.id, 0);
  });

  edges.forEach(edge => {
    if (adj.has(edge.source) && adj.has(edge.target)) {
      adj.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
    }
  });

  // 1. Cycle Detection using DFS with path tracking
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const currentPath: string[] = [];
  const cycleNodes: string[][] = [];

  function dfsCycle(nodeId: string) {
    visited.add(nodeId);
    recStack.add(nodeId);
    currentPath.push(nodeId);

    const neighbors = adj.get(nodeId) || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        dfsCycle(next);
      } else if (recStack.has(next)) {
        // Found a cycle!
        const cycleStartIndex = currentPath.indexOf(next);
        if (cycleStartIndex !== -1) {
          const cycle = currentPath.slice(cycleStartIndex).concat(next);
          cycleNodes.push(cycle);
        }
      }
    }

    recStack.delete(nodeId);
    currentPath.pop();
  }

  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      dfsCycle(n.id);
    }
  });

  const hasCycles = cycleNodes.length > 0;
  if (hasCycles) {
    cycleNodes.forEach(cycle => {
      errors.push({
        type: 'cycle',
        message: `Execution loop detected: ${cycle.map(id => nodeMap.get(id)?.data?.label || id).join(' → ')}`,
        details: cycle
      });
    });
  }

  // 2. Topological Sort (Kahn's Algorithm)
  const topologicalOrder: string[] = [];
  const inDegreeCopy = new Map(inDegree);
  const queue: string[] = [];

  // Start with nodes that have in-degree 0
  nodes.forEach(n => {
    if ((inDegreeCopy.get(n.id) || 0) === 0) {
      queue.push(n.id);
    }
  });

  while (queue.length > 0) {
    const curr = queue.shift()!;
    topologicalOrder.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      const newDeg = (inDegreeCopy.get(neighbor) || 0) - 1;
      inDegreeCopy.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  // 3. Trigger Node Verification
  const triggerNodes = nodes.filter(n => {
    const type = n.data?.type || n.type || '';
    return type.startsWith('trigger_');
  });

  if (triggerNodes.length === 0 && nodes.length > 0) {
    errors.push({
      type: 'missing_trigger',
      message: 'Workflow must have at least one trigger node (e.g. Webhook, Schedule, Gmail, or Manual trigger).'
    });
  }

  // Verify triggers have no incoming edges
  triggerNodes.forEach(trig => {
    if ((inDegree.get(trig.id) || 0) > 0) {
      warnings.push(`Trigger node "${trig.data?.label || trig.id}" has incoming connections. Triggers should initiate workflows.`);
    }
  });

  // 4. Orphan Node Detection
  const orphanNodes: string[] = [];
  if (nodes.length > 1) {
    nodes.forEach(n => {
      const inDeg = inDegree.get(n.id) || 0;
      const outDeg = outDegree.get(n.id) || 0;
      if (inDeg === 0 && outDeg === 0) {
        orphanNodes.push(n.id);
        warnings.push(`Node "${n.data?.label || n.id}" is disconnected and will not be reached by execution.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    hasCycles,
    cycleNodes,
    orphanNodes,
    topologicalOrder,
    errors,
    warnings
  };
}

/**
 * Checks if adding a proposed edge would introduce a loop/cycle
 * Use inside `@xyflow/react` isValidConnection callback
 */
export function wouldCreateCycle(
  nodes: SimpleNode[],
  edges: SimpleEdge[],
  newEdge: { source: string; target: string }
): boolean {
  if (newEdge.source === newEdge.target) {
    return true; // Self loop
  }

  // Construct temporary graph including the new edge
  const tempEdges: SimpleEdge[] = [
    ...edges,
    { id: 'temp_probe_edge', source: newEdge.source, target: newEdge.target }
  ];

  const validation = validateWorkflowGraph(nodes, tempEdges);
  return validation.hasCycles;
}

/**
 * Resolves dynamic variable tokens in strings like:
 * {{trigger.customer.name}} or {{gemini_1.sentiment}}
 */
export function resolveVariables(template: any, context: Record<string, any>): any {
  if (typeof template !== 'string') {
    return template;
  }

  // Exact single variable match: "{{node.output}}" -> returns the actual object/value without converting to string
  const exactMatch = template.match(/^\{\{([a-zA-Z0-9_$.]+)\}\}$/);
  if (exactMatch) {
    const path = exactMatch[1];
    const val = getNestedValue(context, path);
    return val !== undefined ? val : template;
  }

  // Multi-variable string replacement: "Hello {{name}}, your mood is {{gemini.sentiment}}"
  return template.replace(/\{\{([a-zA-Z0-9_$.]+)\}\}/g, (_, path) => {
    const val = getNestedValue(context, path);
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  });
}

function getNestedValue(obj: any, path: string): any {
  if (!obj) return undefined;

  // Support trigger alias: if path starts with "trigger.", check both context.trigger and direct context
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    if (typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Automatically computes clean hierarchical layout coordinates (left-to-right DAG)
 */
export function computeHierarchicalLayout(
  nodes: SimpleNode[],
  edges: SimpleEdge[]
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  const validation = validateWorkflowGraph(nodes, edges);

  const inDegree = new Map<string, number>();
  const childrenMap = new Map<string, string[]>();

  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    childrenMap.set(n.id, []);
  });

  edges.forEach(e => {
    if (inDegree.has(e.target)) {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
    if (childrenMap.has(e.source)) {
      childrenMap.get(e.source)!.push(e.target);
    }
  });

  // Calculate layer / depth for each node
  const layers = new Map<string, number>();
  const queue: Array<{ id: string; layer: number }> = [];

  nodes.forEach(n => {
    if ((inDegree.get(n.id) || 0) === 0) {
      queue.push({ id: n.id, layer: 0 });
      layers.set(n.id, 0);
    }
  });

  while (queue.length > 0) {
    const { id, layer } = queue.shift()!;
    const children = childrenMap.get(id) || [];
    for (const child of children) {
      const existingLayer = layers.get(child) ?? 0;
      const nextLayer = Math.max(existingLayer, layer + 1);
      layers.set(child, nextLayer);
      queue.push({ id: child, layer: nextLayer });
    }
  }

  // Group nodes by layer
  const layerGroups = new Map<number, string[]>();
  nodes.forEach(n => {
    const layer = layers.get(n.id) ?? 0;
    if (!layerGroups.has(layer)) layerGroups.set(layer, []);
    layerGroups.get(layer)!.push(n.id);
  });

  // Position nodes
  layerGroups.forEach((nodeIds, layerIndex) => {
    const totalInLayer = nodeIds.length;
    nodeIds.forEach((nodeId, idx) => {
      const x = 80 + layerIndex * 330;
      const y = 140 + (idx - (totalInLayer - 1) / 2) * 170;
      positions[nodeId] = { x, y: Math.max(60, y) };
    });
  });

  return positions;
}
