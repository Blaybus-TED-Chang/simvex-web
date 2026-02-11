/** 노드 내 첨부 링크 */
export interface WorkflowNodeLink {
  id: string;
  url: string;
  label?: string;
}

/** 캔버스 내 노드 */
export interface WorkflowNode {
  id: string;
  x: number;
  y: number;
  width: number;
  title: string;
  content: string;
  links: WorkflowNodeLink[];
  color?: string;
}

/** 노드 간 연결선 */
export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

/** workflows 테이블 DB Row */
export interface WorkflowRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  visibility: 'private' | 'shared' | 'public';
  share_token: string | null;
  nodes_data: WorkflowNode[];
  edges_data: WorkflowEdge[];
  canvas_offset: number[];
  canvas_zoom: number;
  created_at: string;
  updated_at: string;
}

/** workflow_attachments 테이블 DB Row */
export interface WorkflowAttachmentRow {
  id: string;
  workflow_id: string;
  node_id: string;
  file_name: string;
  file_size_bytes: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
}

/** workflow_saves 테이블 DB Row */
export interface WorkflowSaveRow {
  id: string;
  user_id: string;
  workflow_id: string;
  saved_at: string;
}
