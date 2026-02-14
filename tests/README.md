# VibeLab 测试项目集 (Tests)

本目录包含了从开发环境迁移过来的多个研究项目示例。每个项目都包含了完整的源代码、研究资料以及原始的 Claude CLI 聊天会话记录。

## 项目概览

### 1. [Med-Skills](file:///home/dingjie/workspace/ai-scientist/VibeLab/tests/Med-Skills)
- **目标**: 收集并构建医疗领域的 AI Agent 技能库 (Medical Skill Library)。
- **核心内容**: 包含针对 MICCAI 2026 会议的头脑风暴记录、现有 Medical MCP 工具的集成思路以及技能包装流程。
- **状态**: 包含完整的 Ideation 和资源准备阶段资料。

### 2. [VibeMed](file:///home/dingjie/workspace/ai-scientist/VibeLab/tests/VibeMed)
- **目标**: 结合 VibeLab 能力的医疗研究项目。
- **核心内容**: 包含大量的文献引用 (papers)、自动生成的调研图表以及多代理协作的中间产物。
- **状态**: 拥有非常丰富的文献库和实验过程记录。

### 3. [nlp_qa](file:///home/dingjie/workspace/ai-scientist/VibeLab/tests/nlp_qa) (原 workspace/test3)
- **目标**: 使用神经网络进行生物医学问答 (Biomedical Question Answering) 研究。
- **核心内容**: 包含 BioASQ 数据集的测试样例、元提示词 (metaprompt) 优化记录。
- **状态**: 专注于特定领域的问答性能调优。

---

## 如何将聊天记录 (Claude Sessions) 加载到 VibeLab

每个项目目录下都包含一个 `claude_sessions` 文件夹，里面存储了该项目的原始 Claude CLI 对话历史（`.jsonl` 文件）。如果您想在 VibeLab UI 中查看或恢复这些会话，请按照以下步骤操作：

### 步骤 1：确定项目的路径编码
VibeLab 通过项目绝对路径的编码来管理会话。编码规则是将路径中的 `/` 替换为 `-`。

例如，项目路径为：
`/home/dingjie/workspace/ai-scientist/VibeLab/tests/Med-Skills`

对应的编码文件夹名应为：
`-home-dingjie-workspace-ai-scientist-VibeLab-tests-Med-Skills`

### 步骤 2：将记录复制到 Claude 配置目录
将项目内 `claude_sessions` 文件夹中的所有内容复制到系统默认的 Claude 项目存储路径下。

**终端命令示例：**
```bash
# 创建目标文件夹（替换为实际的编码路径）
mkdir -p ~/.claude/projects/-home-dingjie-workspace-ai-scientist-VibeLab-tests-Med-Skills

# 复制记录文件
cp -r /home/dingjie/workspace/ai-scientist/VibeLab/tests/Med-Skills/claude_sessions/* ~/.claude/projects/-home-dingjie-workspace-ai-scientist-VibeLab-tests-Med-Skills/
```

### 步骤 3：在 VibeLab 中添加项目
1. 打开 VibeLab 网页界面。
2. 点击 **"Add Project"** 或 **"Manual Add"**。
3. 输入项目的完整绝对路径（例如 `/home/dingjie/workspace/ai-scientist/VibeLab/tests/Med-Skills`）。
4. 刷新页面，您就可以在项目的 **"Claude Sessions"** 栏目下看到历史聊天记录了。

### 提示
- **Resume 功能**: 一旦会话记录加载成功，您可以点击 **"Resume"** 按钮继续之前的对话。
- **子代理记录**: `claude_sessions` 中包含的 `subagents` 文件夹也会被同步加载，确保多代理协作的历史也是完整的。
