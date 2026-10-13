/* 原创学习内容；引用材料及核验范围见 sources。 */
window.HANDBOOK = {
  title: '实现领域驱动设计 · 交互学习手册',
  date: '2026-10-13',
  sources: [
    { id: 'toc', name: '出版社：原书目录与书目信息', url: 'https://www.informit.com/store/implementing-domain-driven-design-9780133039900', scope: '核对 14 章、附录 A 的顺序与主题；页码采用 2013 年英文版，中文版本可能不同。' },
    { id: 'sample', name: '出版社：公开样章（含第 10 章）', url: 'https://www.informit.com/content/images/9780321834577/samplepages/0321834577.pdf', scope: '核对聚合四项设计准则、例外情形、并发与依赖处理。未取得整本红皮书全文。' },
    { id: 'code', name: 'Vaughn Vernon：IDDD_Samples', url: 'https://github.com/VaughnVernon/IDDD_Samples/tree/9b27b11773f62afb5d1b541abf51fb36516a7250', scope: '阅读了 Product、ProductApplicationService、ProductRepository、EmailAddress、Discussion 等实现。固定提交 9b27b117；原仓库是书籍参考代码，README 明确说明并非生产质量。' },
    { id: 'agg1', name: '作者文章：Effective Aggregate Design · I', url: 'https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf', scope: '聚合边界与小聚合。手册练习为独立创作，没有复制文章图表。' },
    { id: 'agg2', name: '作者文章：Effective Aggregate Design · II', url: 'https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_2.pdf', scope: '通过标识关联聚合、在边界之外协调一致性。' },
    { id: 'agg3', name: '作者文章：Effective Aggregate Design · III', url: 'https://www.dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_3.pdf', scope: '从业务约束、对象规模与并发代价重新审视设计。' },
    { id: 'cqrs', name: '补充：Martin Fowler · CQRS', url: 'https://martinfowler.com/bliki/CQRS.html', scope: '核对读写模型分离、共用数据库的可能性，以及采用成本。属于补充材料。' },
    { id: 'bc', name: '补充：Martin Fowler · Bounded Context', url: 'https://martinfowler.com/bliki/BoundedContext.html', scope: '补充解释不同边界内同一词语的不同含义。' },
    { id: 'hex', name: '补充：Alistair Cockburn · Hexagonal Architecture', url: 'https://alistair.cockburn.us/hexagonal-architecture', scope: '核对端口与适配器的内外隔离思想。' }
  ],
  chapters: [
    {
      id: 'ch1', n: '01', title: 'DDD 入门', en: 'Getting Started with DDD', page: 1, group: '战略设计', minutes: 3,
      question: '什么时候值得把时间花在建模上？',
      lead: '先找最需要解释和反复修改的业务规则，再选择建模投入。目录、分层、注解只能承载模型；模型是否有用，要看团队能否用它准确讨论业务。',
      topics: ['采用 DDD 的理由与条件', '业务价值与实施挑战', '领域专家、团队协作与通用语言'],
      points: [
        ['识别复杂性', '字段多不一定复杂。评审资格、回避规则、版本冻结、意见如何生效，才是需要推敲的业务语义。'],
        ['把语言变成约束', '“审批一下”太含糊。改成“已分配的审稿人提交意见；两份意见齐备后，编辑结束本轮评审”。'],
        ['按收益投入', '核心评审流程值得持续建模；简单的通知模板管理可以使用清晰的 CRUD。']
      ],
      deeper: [
        '建模会改变需求的表达。与领域专家交谈时，要追问具体反例：作者能否审自己的文章？两位审稿人意见不同怎么办？已经冻结的版本能否改正文？这些答案比先选择 ORM 更能决定代码形状。',
        '“采用 DDD”不是一次性改造项目目录。可以先选择一条变化频繁的业务流程，建立共同术语、写行为示例、实现模型，再用新需求检验它。学习成本、专家参与程度与团队维护能力，都应计入收益判断。'
      ],
      example: { story: '知行是一款企业知识共创平台。团队希望知识条目在入库前接受双人评审，以减少不可靠内容。', decision: '先把“评审通过”的条件写成可讨论的例子，而不是直接设计 status 字段和更新接口。', tradeoff: '这份规则只是本手册的业务假设；实际项目应与专家确认，不能从示例反推现实业务。', lang: '行为示例', code: `场景：一份赞成意见还不足以通过评审
假设 本轮评审已分配李明和王芳，作者是陈晨
当   李明提交“赞成”意见
那么 本轮仍处于开放状态
并且 编辑不能结束本轮评审

场景：两份意见齐备
假设 李明赞成，王芳反对
当   编辑结束本轮评审
那么 结果是“不通过”，并记录本轮结束事件` },
      traps: ['有 domain 包就完成了 DDD。→ 检查业务判断是否仍散落在 Controller 和 SQL 中。', '所有子系统都要使用复杂领域模型。→ 建模投入应与业务价值匹配。'],
      task: '从你熟悉的业务里选一个含糊的动词，写出成功、失败、边界三个例子。',
      answer: '例如“结束评审”：意见齐备时可结束；尚缺一份时拒绝；已结束后重复请求要有明确结果。只有名词清单，还不足以构成模型。',
      quiz: [
        { q: '以下哪个现象最值得优先开展领域建模？', options: ['有 100 张配置表', '同一个“通过”在不同团队有三种互相冲突的解释', 'Controller 方法比较长'], correct: 1, why: '语义冲突直接影响模型和协作。表的数量、方法长度可能是问题，但不能单独证明需要 DDD。' },
        { q: '本轮评审规则尚不明确，最有效的下一步是？', options: ['先建一个通用 BaseDomainService', '先拆分微服务', '和业务人员一起推演具体反例'], correct: 2, why: '先形成可验证的共同理解，再选择实现方式。' }
      ], sources: ['toc'], related: ['ch2', 'ch5', 'ch14']
    },
    {
      id: 'ch2', n: '02', title: '领域、子域与限界上下文', en: 'Domains, Subdomains, and Bounded Contexts', page: 43, group: '战略设计', minutes: 4,
      question: '业务如何划分，模型的含义又在哪里成立？',
      lead: '子域帮助判断业务能力及投入重点；限界上下文划定一个模型和一套语言的适用范围。它们需要对齐，但不是天然一一对应，也不等同于部署服务。',
      topics: ['问题空间与解决方案空间', '核心域、支撑子域、通用子域', '限界上下文中的模型与语言'],
      points: [
        ['子域回答“业务做什么”', '知识可信度评审是本案例的核心能力；文稿管理提供支撑；身份认证可采用通用方案。这个分类取决于企业的竞争目标。'],
        ['上下文回答“词在何处有此含义”', '身份上下文中的用户有账号、启用状态；评审上下文中的审稿人关注专业方向和回避关系。'],
        ['边界先于部署', '一个模块化单体也可以容纳多个上下文。不同团队、术语和规则变化方向，是比“要不要微服务”更早的问题。']
      ],
      deeper: [
        '“用户”可以是相同现实人物的不同模型。身份服务负责认证事实，评审模型负责审稿资格。直接共享一整个 User 实体，会让一个模型的字段和规则渗入另一个模型。应传递标识，并明确本地需要怎样解释外部事实。',
        '边界是可检验的假设。先列出词语的歧义、规则的负责人和变化频率，再画出当前边界。出现大量同步协调时，检查是划分不合理，还是接口泄漏了太多内部细节。'
      ],
      example: { story: '账号停用是身份上下文的事实；“不能评审自己的文稿”是评审上下文的规则。两者都与人有关，但职责不同。', decision: '本地使用最小的审稿人资料，不在评审模型里依赖身份系统的 User 类。', tradeoff: '资料同步会产生新鲜度问题。高风险操作可实时核验；普通展示可以接受缓存，并明确失效策略。', lang: 'Java · 类型示意', code: `// identity 上下文中的模型
record AccountId(String value) {}
// Account 还管理登录凭据、启用状态等，此处省略。

// reviewing 上下文的本地概念
record ReviewerId(String value) {}
record ReviewerProfile(
    ReviewerId id,
    String tenantId,
    Set<String> expertise,
    boolean eligible) {}

// 同一个现实人物，不意味着复用同一个领域类。` },
      traps: ['一张表就是一个子域。→ 子域描述业务能力，表是存储结构。', '限界上下文必须是微服务。→ 语义边界、代码边界与部署边界可以分别设计。'],
      task: '在“文稿 / 评审 / 身份 / 知识目录”之间，分别定义“作者”“审稿人”“读者”。',
      answer: '文稿关心作者与版本归属；评审关心审稿资格与回避；身份关心账号有效性；目录关心读者的可见范围。允许局部模型不同，但跨边界映射必须清晰。',
      quiz: [
        { q: '把系统从单体部署改成四个服务，会自动产生四个限界上下文吗？', options: ['会，部署边界就是语义边界', '不会，还要检查语言、模型与规则边界', '只有用了消息队列才会'], correct: 1, why: '物理拆分不能替代语义建模。' },
        { q: '核心域如何识别？', options: ['看哪个模块代码最多', '看哪个模块用了最先进的数据库', '看哪项业务能力形成关键差异化价值'], correct: 2, why: '核心域是战略判断，不能只根据技术复杂度分类。' }
      ], sources: ['toc', 'bc'], related: ['ch3', 'ch9', 'ch13']
    },
    {
      id: 'ch3', n: '03', title: '上下文映射图', en: 'Context Maps', page: 87, group: '战略设计', minutes: 4,
      question: '两个模型相遇时，谁适应谁，谁负责翻译？',
      lead: '上下文映射不仅是系统连线图，还要表达协作关系、模型影响方向和整合策略。上游通常指模型或契约影响下游的一方，不是简单的请求发送方。',
      topics: ['上下文关系与团队协作', '合作、共享内核、客户供应商', '遵奉者、防腐层、开放主机服务与发布语言'],
      points: [
        ['先画现状', '列出各上下文真正依赖谁，接口由谁控制，变更是否会提前协商。理想中的边界不能掩盖现实耦合。'],
        ['选择翻译责任', '外部身份系统不按评审需求改模型时，评审侧可以用防腐层把账号事实转换为审稿人资料。'],
        ['不要只背缩写', 'ACL 是语义保护；OHS 是稳定开放的服务协议；Published Language 是共同交换语言。三者解决的问题不同，可以组合。']
      ],
      deeper: [
        'Partnership 适用于双方紧密协作、共同安排变更；Shared Kernel 共享一小块模型，需要共同治理；Customer–Supplier 要明确下游需求如何影响上游计划。共享越多，协调成本通常越高。',
        'Conformist 表示下游接受上游模型，适用于改变成本不值得承担的场景；ACL 由下游保护本地语言；Separate Ways 表示没有必要整合。Big Ball of Mud 描述混乱边界的现状，不是推荐的目标。'
      ],
      example: { story: '身份接口返回 staff、enabled 等组织字段。评审领域只需要审稿标识、租户和资格事实。', decision: '身份适配器读取外部 DTO，并通过翻译器返回本地 ReviewerProfile；是否回避由本地规则决定。', tradeoff: '防腐层增加映射与契约测试成本。若语义完全相同，简单显式映射即可，不必建立庞大框架。', lang: 'Java · 防腐层片段', code: `final class ReviewerTranslator {
    ReviewerProfile translate(IdentityPerson source) {
        return new ReviewerProfile(
            new ReviewerId(source.subject()),
            source.organization(),
            Set.copyOf(source.topicCodes()),
            source.enabled() && source.roles().contains("reviewer"));
    }
}
// 外部 DTO 不进入 ReviewCycle 聚合。
// 来源字段变化由此适配；本地回避规则仍由评审模型执行。` },
      traps: ['谁调用接口谁就是上游。→ 调用方向与模型影响方向不是同一回事。', 'ACL 只是 JSON 字段改名。→ 更重要的是概念、状态、单位与规则含义的翻译。'],
      task: '如果身份团队改变 enabled 的含义，哪个位置应最先发现不兼容？',
      answer: '边界适配器的契约测试与语义映射应发现变化。没有这些检查，单纯把字段复制成功并不能证明业务含义仍然正确。',
      quiz: [
        { q: '两个团队共享一小段领域模型，并约定共同测试和发布，属于？', options: ['Shared Kernel', 'Separate Ways', 'Conformist'], correct: 0, why: '共享内核强调有限的共同模型以及协调机制。' },
        { q: '防腐层主要保护什么？', options: ['网络绝对不失败', '本地模型不被外部语义侵入', '数据库完全不需要迁移'], correct: 1, why: '超时与重试属于整合工程；ACL 的主要职责是维护本地模型含义。' }
      ], sources: ['toc', 'bc'], related: ['ch2', 'ch13'], lab: 'context'
    },
    {
      id: 'ch4', n: '04', title: '架构', en: 'Architecture', page: 113, group: '战略设计', minutes: 5,
      question: '怎样让技术机制承载模型，而不淹没模型？',
      lead: '架构需要给业务规则一个稳定的位置，并允许更换输入与存储方式。分层、六边形、CQRS 和事件驱动各有用途，不需要一次性全部采用。',
      topics: ['分层与依赖倒置', '六边形、SOA 与 REST', 'CQRS、事件驱动、数据网格'],
      points: [
        ['分离职责与依赖', '应用层编排用例；领域层作业务判断；适配器处理 HTTP、SQL、消息。运行时调用链与源码依赖方向要分别看。'],
        ['按问题采用 CQRS', '评审命令需要完整规则；评审列表只需要摘要 DTO。读写可用不同模型，也可以使用同一个数据库。'],
        ['技术不是标配', '事件驱动帮助跨边界协作，但引入重复、延迟与失败恢复。数据网格是架构选项，不是 DDD 的必要组成。']
      ],
      deeper: [
        '端口是系统所需或提供的能力。入站端口表达“提交评审意见”，出站端口表达“取回评审轮次”。HTTP 和 JDBC 分别作为适配器实现技术细节。领域接口不应为了适配器方便泄漏 Connection、ResultSet 或 HTTP Response。',
        'REST 关注资源及协议约束，SOA 关注服务化协作，都不自动保证领域模型合理。单个上下文可先使用分层与端口适配器；只有读写负载或模型差异明显时再增加 CQRS。同步同库的读写模型分离可以没有投影延迟。'
      ],
      example: { story: '评审列表需要文稿标题、审稿进度和结果。让页面通过聚合逐个加载，会把查询需求挤进写模型。', decision: '命令调用 ReviewApplicationService；查询经 ReviewQueryService 返回 ReviewSummary。SQL 放在查询适配器中。', tradeoff: '读侧可以绕过聚合，但租户隔离、权限、分页仍要执行。若使用异步投影，界面要表达更新延迟。', lang: 'Java · 端口示意', code: `// 入站用例
interface SubmitReviewUseCase {
    void submit(SubmitReview command, Actor actor);
}

// 查询模型可以独立于写侧聚合
interface ReviewQueries {
    List<ReviewSummary> assignedTo(
        TenantId tenant, ReviewerId reviewer, int limit);
}

// JDBC 实现在外层：JdbcReviewQueries implements ReviewQueries
// 不要求 Controller 直接拿到 JDBC 才叫“轻量 CQRS”。` },
      traps: ['CQRS = 两个数据库 + 消息队列 + 事件溯源。→ 这些机制可组合，但不等价。', '分层就是所有代码只能逐层调用。→ 先区分源码依赖、接口归属和运行时调用。'],
      task: '把“结束评审后搜索列表马上更新”拆成业务承诺与技术选择。',
      answer: '先确认“马上”的允许延迟。若必须在返回后读到新状态，可以同库查询或返回命令结果；异步投影需要可见的同步状态，不能悄悄降低业务承诺。',
      quiz: [
        { q: 'CQRS 必须使用不同的数据库吗？', options: ['必须', '不必，关键在读写模型的职责分离', '只要叫 DDD 就必须'], correct: 1, why: '独立存储是进一步选择，需要同步与运维成本。' },
        { q: 'JDBC 仓储实现最合适依赖哪一方？', options: ['领域仓储接口', 'Controller', '页面组件'], correct: 0, why: '适配器实现内层定义的能力，使业务模型不依赖 JDBC 类型。' }
      ], sources: ['toc', 'hex', 'cqrs'], related: ['ch8', 'ch12', 'ch14', 'appendix'], lab: 'events'
    },
    {
      id: 'ch5', n: '05', title: '实体', en: 'Entities', page: 171, group: '战术建模', minutes: 4,
      question: '属性变化之后，为什么它仍是同一个东西？',
      lead: '实体的核心是跨越变化的身份和生命周期。评审轮次可以从开放变成已结束，但它仍是原来的那一轮；它应提供有业务含义的操作。',
      topics: ['唯一身份及其产生方式', '发现实体与职责', '身份相等、验证与状态变化'],
      points: [
        ['身份先有语义', 'ReviewCycleId 标识一轮评审，DocumentVersionId 标识一个冻结版本。即便底层都是 UUID，也不能混用。'],
        ['行为维护状态', '通过 submit、finish 表达业务意图，避免公开 setStatus 让任意代码跳过条件。'],
        ['验证分层', '输入格式由边界校验；对象自身约束由领域模型校验；全局唯一等并发约束还要由存储机制共同保证。']
      ],
      deeper: [
        '身份来源可以是业务天然标识、应用生成标识、数据库生成标识或其他上下文提供的标识。选择时考虑何时需要身份、跨系统关联和并发创建。数据库主键未必是领域身份。',
        '实体相等应遵循身份语义，不能把所有可变字段自动纳入 equals/hashCode。还要明确身份的唯一范围：若标识只在租户内唯一，就需要 TenantId 与本地 ID 一起解释。'
      ],
      example: { story: '同一篇文稿修改后重新送审，会产生新的轮次。旧评审不能因为标题相同就被当作新评审。', decision: '用独立轮次 ID 跟踪生命周期，保存被评审的不可变版本标识。', tradeoff: '增加一个 ID 不代表它必然是聚合根。实体边界要到第 10 章结合一致性规则决定。', lang: 'Java · 实体行为片段', code: `final class ReviewCycle {
    private final ReviewCycleId id;
    private final DocumentVersionId versionId;
    private Status status;

    // 构造、提交意见等逻辑省略；完整模型在 examples 中。
    public void requireOpen() {
        if (status != Status.OPEN) {
            throw new IllegalStateException("本轮评审已结束");
        }
    }
    // 不提供 public setStatus(Status)。
}` },
      traps: ['用了 @Entity 就有了领域实体。→ ORM 注解定义映射，领域身份与行为仍需建模。', '实体必须与数据库表一一对应。→ 模型边界与表结构解决不同问题。'],
      task: '同一文稿的第 1 版与第 2 版，是否应该共享评审轮次 ID？',
      answer: '本案例不共享。意见针对冻结版本；新版本的新一轮评审拥有新身份，才能保留旧结论的适用范围。',
      quiz: [
        { q: '最能说明一个概念是实体的理由是？', options: ['属性有十几个', '需要跟踪它在属性变化后的连续身份', '需要放入 Redis'], correct: 1, why: '身份与生命周期才是实体的核心特征。' },
        { q: '把实体的全部可变字段放进 hashCode 有什么风险？', options: ['修改后在 HashSet 中可能找不到', '会变成值对象', '没有任何风险'], correct: 0, why: '哈希键的可变性会破坏集合使用契约；实体相等要按稳定身份设计。' }
      ], sources: ['toc', 'code'], related: ['ch6', 'ch10', 'ch11']
    },
    {
      id: 'ch6', n: '06', title: '值对象', en: 'Value Objects', page: 219, group: '战术建模', minutes: 4,
      question: '哪些概念只关心“是什么值”，无需追踪独立身份？',
      lead: '值对象把一组共同表达含义的值和约束放在一起。评审时间窗由起止时间共同决定，可整体替换、按值比较，并应避免可变状态泄漏。',
      topics: ['值语义、不变性与整体替换', '标准类型与最小化集成', '测试、实现及持久化'],
      points: [
        ['封装完整概念', '开始和结束时间分别合法，还不够；开始必须早于结束，才能构成有效的时间窗。'],
        ['无副作用的行为', 'contains(now) 判断时刻是否有效，不修改时间窗。调整时间时返回一个新对象。'],
        ['record 只是工具', 'record 自动提供按组件比较等能力，但只保证引用字段不可重新赋值；集合仍需防御性复制。']
      ],
      deeper: [
        '使用 Instant 明确本例按绝对时间比较；界面展示的时区由边界转换。规定区间为左闭右开 [opensAt, closesAt)，可以避免“截止瞬间是否还能提交”的模糊语义。',
        '持久化值对象时，可映射到聚合的多列、嵌入类型或序列化字段，取决于查询与演进需要。数据库为了存储添加的代理键，不必变成值对象的领域身份。'
      ],
      example: { story: '审稿截止为 18:00，用户在恰好 18:00:00 提交意见。系统不能让不同入口各自猜测边界。', decision: 'ReviewWindow 集中表达区间语义；聚合调用它来决定是否允许提交。', tradeoff: '格式与区间校验可以属于值对象；“延期是否需要编辑批准”是另一条业务规则，不能塞进通用日期工具。', lang: 'Java 21 · 完整值对象定义', code: `record ReviewWindow(Instant opensAt, Instant closesAt) {
    ReviewWindow {
        Objects.requireNonNull(opensAt);
        Objects.requireNonNull(closesAt);
        if (!opensAt.isBefore(closesAt)) {
            throw new IllegalArgumentException("起始时间必须早于截止时间");
        }
    }
    boolean contains(Instant now) {
        return !now.isBefore(opensAt) && now.isBefore(closesAt);
    }
}
// 所需导入：java.time.Instant; java.util.Objects;
// 该定义也包含在可运行的 ReviewExample.java 中。` },
      traps: ['没有数据库 ID 就一定是值对象。→ 判断依据是身份需求与业务语义。', 'record 天然深度不可变。→ List、数组等组件仍可能被外部修改。'],
      task: '为 ReviewWindow 写三条边界检查：起始瞬间、截止前一纳秒、截止瞬间。',
      answer: '本案例 [start, end) 的结果分别是 true、true、false。另外构造时应拒绝 start == end 及 start > end。',
      quiz: [
        { q: '两个时间窗起止时间完全相同，本案例应如何比较？', options: ['比较数据库主键', '按值相等', '只能比较内存地址'], correct: 1, why: '时间窗不需要独立身份，其含义由值决定。' },
        { q: 'record Reviewers(List<ReviewerId> ids) 需要额外注意什么？', options: ['必须继承 Entity', '必须加入一个 UUID', '复制集合以防外部修改'], correct: 2, why: 'record 的浅层不变性不足以保护传入的可变集合。' }
      ], sources: ['toc', 'code'], related: ['ch5', 'ch10', 'ch12']
    },
    {
      id: 'ch7', n: '07', title: '领域服务', en: 'Services', page: 265, group: '战术建模', minutes: 4,
      question: '某条规则不自然属于任何实体时，把它放在哪里？',
      lead: '领域服务承载有明确业务含义、却不自然属于某个实体或值对象的操作。应用服务负责完成用例所需的协调。是否操作多个对象不是唯一判断标准。',
      topics: ['什么是及不是什么是领域服务', '判断是否真的需要服务', '建模与测试'],
      points: [
        ['规则与编排分开', '“匹配专业方向且排除作者”是业务判断；加载候选资料、保存结果、开启事务是用例协调。'],
        ['先给对象行为', '“意见齐备才能结束”自然属于 ReviewCycle。不要把它搬到 ReviewDomainService，导致实体只剩 getter/setter。'],
        ['名字表达职责', '可叫 ReviewerSelectionPolicy 或 ReviewerMatchingService；应用层可叫 ReviewApplicationService 或 SubmitReviewHandler。后缀不是 DDD 规范。']
      ],
      deeper: [
        '领域服务通常不持有某次业务实例的可变状态，但可以依赖抽象能力；是否纯函数由场景决定。把可准备的数据传入规则，可让测试更简单，也便于明确规则依据哪个时刻的事实。',
        '仓储保存不需要经由领域服务。应用服务加载聚合，调用聚合或领域服务，再通过仓储提交。若使用 ORM 工作单元，也可能通过脏检查提交，必须清楚具体仓储契约。'
      ],
      example: { story: '候选审稿人的专业方向来自资料，文稿作者和主题来自文稿快照。匹配规则既不属于账号，也不属于某一位审稿人。', decision: '独立的 ReviewerSelectionPolicy 筛选候选人；应用服务取得资料、安排人选并保存评审轮次。', tradeoff: '匹配结果只说明规则计算时满足条件，不会自动锁住外部身份状态。资格撤销的业务时点需要另行约定。', lang: 'Java · 规则片段', code: `final class ReviewerSelectionPolicy {
    boolean suitable(DocumentSnapshot document, ReviewerProfile candidate) {
        return candidate.eligible()
            && candidate.tenantId().equals(document.tenantId())
            && !candidate.id().value().equals(document.authorId())
            && candidate.expertise().contains(document.topic());
    }
}
// 没有 save()，没有 HTTP，也没有事务注解。
// 这是本案例选择的纯规则形式，并非要求所有领域服务都是纯函数。` },
      traps: ['DDD 项目必须有一个 DomainService 类。→ 没有适合它的规则就不创建。', '领域服务不能依赖任何接口。→ 要避免的是职责混乱和技术泄漏，不是机械禁止依赖。'],
      task: '给下面两句话分工：“审稿人不能是作者”；“取回评审轮次并保存提交结果”。',
      answer: '前者是领域规则，安排人选时由模型或策略保护；后者是应用编排。数据库是否真的写入，还取决于仓储与事务适配器。',
      quiz: [
        { q: '谁通常组织“加载聚合 → 调用行为 → 保存聚合”？', options: ['应用服务', '领域服务必须承担', '值对象'], correct: 0, why: '这是用例协调；业务决策由模型承担。' },
        { q: '领域服务最可靠的识别依据是？', options: ['方法参数至少三个对象', '方法名以 process 开头', '有领域含义且找不到自然的实体或值对象归属'], correct: 2, why: '不要按参数数量或类名来识别领域服务。' }
      ], sources: ['toc', 'code'], related: ['ch10', 'ch11', 'ch14']
    },
    {
      id: 'ch8', n: '08', title: '领域事件', en: 'Domain Events', page: 285, group: '战术建模', minutes: 5,
      question: '业务已经发生的事实，怎样可靠地被其他部分获知？',
      lead: '事件表达已发生的业务事实。聚合产生事件，只说明它作出了某个决定；数据提交、对外投递和消费者完成处理，是不同的时间点。',
      topics: ['事件的用途与建模', '发布、存储与跨上下文传播', '通知日志及消息中间件'],
      points: [
        ['过去时表达事实', 'ReviewCompleted 表达评审已经结束；CompleteReview 是请求。请求可能失败，事实不应被消费者重新解释成待审批命令。'],
        ['对象不等于协议', '内部事件可以贴近本地模型；外部集成事件需考虑版本、标识、最小数据、隐私和兼容性。'],
        ['可靠性要有机制', '状态与待投递记录同事务写入，再异步转发，是本手册采用的 Outbox 工程方案。重复投递仍需消费者幂等。']
      ],
      deeper: [
        '同步进程内订阅可让同事务内的动作紧密协作，却也可能扩大事务范围与失败影响。跨上下文通知应明确：可接受多少延迟、失败后谁恢复、如何观察积压、是否需要有序处理。',
        '第 8 章的事件存储主题不能直接等同于附录的事件溯源。保存供转发的事件，可以与保存当前聚合状态并存；只有把事件流作为状态事实来源、用它重建模型，才进入事件溯源设计。'
      ],
      example: { story: '评审已结束，但服务在发送消息前崩溃，知识目录一直显示“评审中”。', decision: '本地事务提交聚合状态与 Outbox；恢复后继续发送，目录以事件 ID 去重，并以轮次版本防止旧消息覆盖新结果。', tradeoff: '这是现代工程补充，浏览器实验只演示失败窗口。真实系统还需租约、退避、死信、告警与补偿策略。', lang: 'Java · 事件契约示意', code: `record ReviewCompleted(
    UUID eventId,
    String tenantId,
    String cycleId,
    String documentVersionId,
    long aggregateVersion,
    String result,
    Instant occurredAt,
    int schemaVersion) {}

// 不把聚合对象整体序列化为跨上下文消息。
// eventId 去重；aggregateVersion 表达该聚合内的顺序。
// 不承诺多个聚合之间存在全局顺序。` },
      traps: ['发布了 Java 事件，消息就一定不会丢。→ 提交边界和持久化机制必须具体说明。', '有事件表就是 Event Sourcing。→ 要看聚合状态的事实来源。'],
      task: '状态已提交，消息已被消费，但发送方在收到确认前崩溃，重发会怎样？',
      answer: '会出现重复投递。消费者应在同一本地事务内记录 eventId 与修改业务结果；若还调用邮件等外部系统，需要它自己的幂等协议，数据库去重无法覆盖一切副作用。',
      quiz: [
        { q: '采用 Outbox 后是否就获得端到端“恰好一次”？', options: ['是，发送端已经持久化', '不是，重复与消费者副作用仍需处理', '只有使用 UUID 才是'], correct: 1, why: 'Outbox 解决本地状态与待发送记录的一致性，不能消除所有投递歧义。' },
        { q: '哪一个名字更适合领域事件？', options: ['PleaseCompleteReview', 'UpdateReviewStatus', 'ReviewCompleted'], correct: 2, why: '领域事件描述过去发生的事实，而不是要求别人执行的动作。' }
      ], sources: ['toc', 'code'], related: ['ch13', 'appendix', 'ch4'], lab: 'events'
    }
  ]
};

window.HANDBOOK.chapters.push(
  {
    id: 'ch9', n: '09', title: '模块', en: 'Modules', page: 333, group: '战术建模', minutes: 3,
    question: '代码目录能否帮助读者看见业务模型？',
    lead: '模块聚合内聚的概念、控制依赖，并用领域语言命名。它不只是构建工具中的 Maven module，也不需要因为目录变大就立即拆出新上下文。',
    topics: ['模块设计及命名', '领域模块与其他层模块', '模块和限界上下文的关系'],
    points: [
      ['先让业务可见', 'reviewing、documents、catalog 比全系统共享的 controller、service、dao 更能表达业务边界。'],
      ['在边界内分工', 'reviewing 内再有 application、domain、adapter；较大的领域模型还可按 reviewcycle、reviewer 等概念组织。'],
      ['用依赖检查保护', '靠命名不能阻止越界访问。构建边界、包可见性与架构测试可以共同约束依赖。']
    ],
    deeper: [
      '模块内部应共享相近的语言和变更原因。若每个业务改动都同时修改十个模块，应检查拆分是否只是按技术步骤切碎，而不是围绕内聚概念组织。',
      '通用的日期工具不属于共享内核；复制少量稳定的 ID 包装类也可能比建立全企业共享实体更安全。提取 shared 或 common 之前，先说明共享语义由谁治理、如何兼容演进。'
    ],
    example: { story: '知识目录想显示评审状态，开发者直接 import reviewing.domain.ReviewCycle，开始依赖它的内部字段。', decision: '通过对外的查询契约或事件交换信息，保持领域包不作为全系统公共模型。', tradeoff: '多个边界各有自己的 DTO 或 ID 类型，会产生少量重复；这可以换取独立演进。', lang: '包职责清单', code: `cn.zhixing.reviewing.application     用例、事务协调
cn.zhixing.reviewing.domain          评审轮次、规则、仓储契约
cn.zhixing.reviewing.adapter.web     HTTP 转换、认证上下文
cn.zhixing.reviewing.adapter.jdbc    聚合持久化与查询
cn.zhixing.reviewing.adapter.identity 外部身份资料翻译
cn.zhixing.reviewing.contract        稳定的外部消息协议

cn.zhixing.documents                文稿与冻结版本
cn.zhixing.catalog                  可检索的知识条目

// 本清单是阅读用组织示意；不是要求逐项创建 Maven 子模块。` },
    traps: ['common/domain 放所有实体最容易复用。→ 也最容易形成跨上下文耦合。', '一个 Java package 必须对应一个限界上下文。→ 模块可以是上下文内部的组织单位。'],
    task: '评审侧重命名内部状态枚举，为什么目录上下文不应该一起修改？',
    answer: '目录应依赖稳定契约，而不是评审的内部枚举。边界适配负责把内部模型转换成对外可兼容的状态含义。',
    quiz: [
      { q: '模块命名优先暴露什么？', options: ['采用的数据库品牌', '业务概念与职责', '作者姓名'], correct: 1, why: '名称是通用语言的一部分，应帮助读者理解模型。' },
      { q: '什么最能说明 common 包需要审查？', options: ['包含一个日期格式化函数', '包含多个上下文共同修改的 User、Document 大实体', '只有十行代码'], correct: 1, why: '共享大模型往往让独立边界的变化互相传播。' }
    ], sources: ['toc', 'code'], related: ['ch2', 'ch4', 'ch13']
  },
  {
    id: 'ch10', n: '10', title: '聚合', en: 'Aggregates', page: 347, group: '战术建模', minutes: 6,
    question: '哪些规则必须在一次提交时同时成立？',
    lead: '把必须即时成立的业务约束放进同一一致性边界，由聚合根保护。边界大小取决于规则、并发和对象规模，不能仅凭表关系决定。',
    topics: ['真实不变量与一致性边界', '小聚合、按标识引用、边界外最终一致', '例外、设计探索、乐观并发与实现'],
    points: [
      ['从反例推边界', '若“结束时必须有两份意见”必须即时成立，结束状态与本轮意见需要在提交时一起校验。'],
      ['让规模有上限', '本案例每轮固定两位审稿人，聚合内只有有限的意见；正文、历史全部轮次与讨论串不纳入。'],
      ['同时设计并发控制', '内存中的 if 只能保护当前对象。持久化要以版本检查、锁或等价机制拒绝相互覆盖的更新。']
    ],
    deeper: [
      '聚合根是外部修改入口，内部对象不应被外部引用后任意改写。跨聚合以身份关联，可以减少隐式加载与跨边界修改的诱惑。边界之外如何达到一致，要明确责任与可接受延迟。',
      '“一个事务修改一个聚合”应作为重要设计起点，而不能当作忽视业务的绝对口号。原书第 10 章专门讨论例外。若确需同事务修改多个聚合，应说明不变量、竞争范围与技术约束；Outbox 记录也不应机械视为另一个业务聚合。',
      '把所有关联都收进一个根，会让互不相关的写操作争用同一个版本；拆得过细又可能失去真正的不变量。先测量有界集合的规模和热点，再决定。数据库外键能保证引用存在，却不能自动保护所有业务规则。'
    ],
    example: { story: '编辑结束评审时，必须看到两名指定审稿人的最终意见。任意一份反对，则整轮不通过。', decision: 'ReviewCycle 持有两名审稿人的 ID、意见、状态和时间窗；只引用冻结文稿版本的 ID。', tradeoff: '聚合内的不同审稿人提交意见，也可能发生版本冲突；重新加载后重新判断，而不是跳过检查强行覆盖。', lang: 'Java · 聚合方法片段', code: `public void finish(Instant now) {
    requireOpen();
    if (opinions.size() != reviewerIds.size()) {
        throw new IllegalStateException("两份意见尚未齐备");
    }
    status = opinions.values().stream().allMatch(v -> v == Vote.APPROVE)
        ? Status.ACCEPTED : Status.REJECTED;
    pendingEvents.add(new ReviewCompleted(
        UUID.randomUUID(), id, status, now));
}
// 此处事件是本地事件形状；第 8 章展示的是外部契约形状。
// 完整可运行模型见 examples/ReviewExample.java。` },
    traps: ['一个聚合只能有一个实体或一张表。→ 看一致性，不看数量。', '聚合越小越好。→ 不能牺牲真实的不变量；有界的小集合可能合理。'],
    task: '如果改成公开评审，允许十万份意见，是否继续把所有意见装进 ReviewCycle？',
    answer: '原来的有界规模假设已经失效。要重新确认“齐备”的定义、是否允许延迟汇总，考虑独立意见、计数或阶段性封口协议；不能只把 List 换成懒加载就宣布问题解决。',
    quiz: [
      { q: '决定聚合边界最有力的依据是？', options: ['数据库外键关系', '同一个页面显示的数据', '必须即时成立的业务不变量'], correct: 2, why: '关联、展示和事务约束不是同一类关系。' },
      { q: '两个请求都从版本 7 读出聚合，版本校验应怎样处理第二次保存？', options: ['无条件覆盖', '检测冲突，让调用方重新加载并判断', '丢弃第一份结果'], correct: 1, why: '乐观锁拒绝过期写入；如何重试与返回冲突属于应用协议。' }
    ], sources: ['sample', 'agg1', 'agg2', 'agg3'], related: ['ch5', 'ch6', 'ch12'], lab: 'aggregate'
  },
  {
    id: 'ch11', n: '11', title: '工厂', en: 'Factories', page: 389, group: '战术建模', minutes: 3,
    question: '怎样创建一个一出生就有效的领域对象？',
    lead: '创建也是业务行为。工厂集中表达创建条件与复杂装配；简单创建可以使用构造器或命名静态方法，不必为了模式增加一个类。',
    topics: ['领域模型中的工厂', '聚合根上的工厂方法', '服务作为工厂'],
    points: [
      ['让意图出现在名字中', 'ReviewCycle.open 比 new + 一串 setter 更清楚地表达“开启一轮评审”。'],
      ['创建时拒绝非法组合', '审稿人数量、重复、作者回避、版本引用与时间窗，应在创建过程完成必要校验。'],
      ['创建与恢复有区别', '从数据库恢复已有对象，不应再次发送“已创建”事件。恢复路径也应有清晰的持久化契约。']
    ],
    deeper: [
      '在某个已有聚合上设置工厂方法，可以表达自然的业务创建关系，但不意味着新对象就必须成为该聚合的内部成员。是否属于同一聚合，要回到事务不变量。',
      '工厂可返回有效对象，让应用服务负责保存；如果创建依赖多个资料或业务策略，可由专门服务协调构造。不要让工厂悄悄调用外部系统和提交事务，导致创建契约难以理解。'
    ],
    example: { story: '同一轮误分配两次同一个人，就算两条分配记录，也不等于两位独立审稿人。', decision: '工厂接收 List 后先检查唯一性和数量，不能直接转 Set 后悄悄吞掉重复输入。', tradeoff: '重建数据时不重复产生事件；迁移和历史规则变化也需要与新建路径分开考虑。', lang: 'Java · 工厂片段', code: `static ReviewCycle open(ReviewCycleId id,
        ReviewerId author, List<ReviewerId> reviewers,
        ReviewWindow window) {
    var unique = Set.copyOf(reviewers);
    if (reviewers.size() != 2 || unique.size() != 2) {
        throw new IllegalArgumentException("需要两位不同的审稿人");
    }
    if (unique.contains(author)) {
        throw new IllegalArgumentException("作者不能评审自己");
    }
    return new ReviewCycle(id, unique, window);
}
// 为聚焦创建职责，此片段省略租户与文稿版本参数。` },
    traps: ['所有实体必须有一个同名 Factory 类。→ 工厂是一项职责，不是类数量指标。', '重建对象就是重新执行创建用例。→ 不应重发创建事件或再做一次外部副作用。'],
    task: '构造器里自动发送 MQ 消息，会怎样影响从数据库恢复对象？',
    answer: '读取可能触发业务副作用，事务失败时还可能发出不存在的事实。创建事实应在清晰的命令和提交路径产生。',
    quiz: [
      { q: '工厂方法返回了一个新聚合，谁通常组织持久化？', options: ['应用服务', '必须由工厂立即提交事务', '浏览器'], correct: 0, why: '创建有效对象与组织事务提交属于不同职责。' },
      { q: '恢复历史状态时最应避免什么？', options: ['显式映射字段', '再次产生“刚刚创建”事件', '读取持久化版本号'], correct: 1, why: '恢复不是新的业务创建，不能让读取产生重复事实。' }
    ], sources: ['toc', 'code'], related: ['ch5', 'ch7', 'ch12']
  },
  {
    id: 'ch12', n: '12', title: '资源库／仓储', en: 'Repositories', page: 401, group: '落地整合', minutes: 5,
    question: '如何让模型被保存，而不把存储细节塞进模型？',
    lead: '仓储围绕聚合的取回与持久化提供契约。它可以像对象集合，也可以显式暴露保存语义；选择哪一种，就要把事务、并发和失败处理说明白。',
    topics: ['面向集合与面向持久化的仓储', '事务、类型层次与额外行为', '仓储和 DAO 的区别及测试'],
    points: [
      ['围绕聚合而非每张表', 'ReviewCycleRepository 负责整个评审轮次，不要求每个值对象各有一个 Repository。'],
      ['明确 save 的含义', '本例采用显式保存及 expectedVersion。ORM 自动脏检查是另一种实现，不应混淆。'],
      ['查询模型可独立', '统计列表不必恢复全部领域对象。用专门查询端口返回 DTO，仍保护权限与数据边界。']
    ],
    deeper: [
      '面向集合的仓储让取回的对象像处于受管理的集合，工作单元可以在提交时跟踪变化；面向持久化的仓储常要求显式 save。本手册用后者，便于看清保存时机与版本参数。',
      '更新根记录和内部意见表必须使用同一事务。带版本条件的更新返回 0 行时，不要继续提交意见明细或事件。先回滚整个工作单元，再决定是否重新加载重试。内存假实现不能证明 JDBC 的隔离和映射正确。'
    ],
    example: { story: 'A、B 同时读到版本 7，各自提交一份不同意见。若仓储直接覆盖整个对象，其中一份意见会消失。', decision: '更新根时带 expectedVersion；失败后回滚所有明细改动，重新加载再提交。', tradeoff: '乐观锁适合冲突比例可接受的场景。热点很高时，需要评估锁策略、操作粒度和聚合边界，而不是无限重试。', lang: 'Java + SQL · 持久化契约', code: `interface ReviewCycleRepository {
    Loaded<ReviewCycle> get(TenantId tenant, ReviewCycleId id);
    void save(ReviewCycle cycle, long expectedVersion);
}

-- 下列语句在适配器的本地事务内执行：
UPDATE review_cycle
SET status = :status, version = version + 1
WHERE tenant_id = :tenant
  AND id = :id AND version = :expected;

-- 影响 0 行：冲突或不存在，整个事务回滚。
-- 影响 1 行：继续保存内部意见与 Outbox，再一起提交。` },
    traps: ['只要 save 前检查了 version 就安全。→ 检查与更新必须形成原子条件。', '仓储必须继承通用 CRUD 大接口。→ 按模型真正需要的操作定义契约。'],
    task: '根的版本更新成功，但写入第二条意见时失败，该提交什么？',
    answer: '本例要求根、内部意见与待投递记录同事务提交，所以全部回滚。否则聚合的持久化状态会被拆开。',
    quiz: [
      { q: '仓储版本冲突时，正确的基本动作是？', options: ['忽略版本再写一次', '只提交已经成功的明细', '回滚本次工作单元并按策略处理冲突'], correct: 2, why: '不能让一个聚合的持久化状态部分成功。' },
      { q: '一个值对象通常需要自己的仓储吗？', options: ['通常不需要，随聚合持久化', '一定需要', '只要是 record 就需要'], correct: 0, why: '没有独立生命周期的聚合内部值，不必暴露独立写入口。' }
    ], sources: ['toc', 'code'], related: ['ch10', 'ch14'], lab: 'concurrency'
  },
  {
    id: 'ch13', n: '13', title: '集成限界上下文', en: 'Integrating Bounded Contexts', page: 449, group: '落地整合', minutes: 5,
    question: '模型独立以后，如何协调业务结果与失败？',
    lead: '跨边界协作必须定义契约、翻译、时序和失败责任。同步 REST 可以得到即时响应，消息可以降低时间耦合，但两者都不能自动解决一致性。',
    topics: ['集成基础与语义翻译', 'REST 资源整合', '消息驱动整合'],
    points: [
      ['先写业务时序', '评审完成后，目录可以在数秒内更新；这与“评审自身是否结束”是两个承诺。'],
      ['协议允许演进', '消息使用稳定字段与 schemaVersion，不直接暴露内部枚举或完整实体序列化结果。'],
      ['消费者要处理现实', '重复、乱序、超时和未知版本都需要策略。重试要有上限与告警，不能让失败无限隐藏。']
    ],
    deeper: [
      '同步调用要设定超时、响应语义与失败界限。远程读取到的资格快照不等于锁定了外部账号；若要求严格同步撤权，需要新的协议，不能靠本地 @Transactional 跨越网络解决。',
      '消息消费可在本地事务里写入 Inbox 去重记录并更新目录。以 eventId 去重只能处理同一消息的重复，不能阻止旧事件覆盖新状态；后者需要按同一聚合的序号检查，必要时缓存缺口并补取。'
    ],
    example: { story: '目录消费成功后在确认消息前崩溃，重启会再次收到相同事件。', decision: '把去重记录与目录更新放在同一个数据库事务中；只有更新完成才确认消息。', tradeoff: '如果目录还要调用外部邮件服务，这个本地事务无法覆盖邮件发送。需要通知系统自己的幂等键或独立待发记录。', lang: 'SQL · 消费者事务示意', code: `BEGIN;

INSERT INTO inbox (consumer, event_id)
VALUES ('catalog-review-v1', :eventId)
ON CONFLICT DO NOTHING;

-- 应用必须检查本次 INSERT 的影响行数：
-- 0：重复事件，跳过业务更新；1：继续验证版本并更新目录。
-- 任何后续错误都回滚，包括上面的 inbox 插入。

COMMIT;
-- 提交成功后才 ACK；此处没有声称端到端 exactly-once。` },
    traps: ['换成消息就不存在耦合。→ 契约、语义与时序仍有耦合。', '@Transactional 可以回滚远程 API。→ 一般只覆盖配置的本地资源事务。'],
    task: '同一个事件重投与两个不同事件乱序，处理方式有何不同？',
    answer: '重复用消费者范围内的 eventId 唯一约束识别；乱序用聚合序号或业务版本识别。若事件是增量，应补齐缺失事件；若是完整快照，可按设计跳过旧快照。',
    quiz: [
      { q: '去重记录先提交，目录更新后失败，会有什么问题？', options: ['没有问题', '重试可能被当成已处理，导致更新永久遗漏', '会自动恢复'], correct: 1, why: '去重与本地业务更新必须形成同一个原子提交。' },
      { q: '收到新 schemaVersion 且无法解释消息时，应优先？', options: ['猜测字段含义继续更新', '静默丢弃并确认成功', '隔离失败并报警，等待兼容处理'], correct: 2, why: '不能在语义未知时制造错误业务事实。' }
    ], sources: ['toc', 'code'], related: ['ch3', 'ch8', 'ch14'], lab: 'events'
  },
  {
    id: 'ch14', n: '14', title: '应用程序', en: 'Application', page: 509, group: '落地整合', minutes: 5,
    question: '怎样把领域模型组合成用户真正能完成的用例？',
    lead: '应用服务组织一次用例：辨认操作者、取得模型、调用业务行为、提交结果。界面围绕用户目标表达动作，基础设施负责把这些动作可靠地落实。',
    topics: ['用户界面与任务表达', '应用服务和多上下文组合', '基础设施与企业容器'],
    points: [
      ['让用例清晰可见', 'SubmitReview、FinishReview 比一个 update(Map fields) 更能表达用户的目标与允许的行为。'],
      ['编排不抢业务判断', '应用层安排事务和仓储；“意见是否齐备”由聚合判断。应用层不再复制一份同样的规则。'],
      ['提交只是协议的一部分', '客户端重试、权限、并发冲突、消息延迟和错误展示，都需要在用例边界有明确结果。']
    ],
    deeper: [
      '权限具有不同层次：HTTP 适配器确认凭据，应用服务确认本用例的访问权，领域模型保护作者回避、指定审稿人才能提交等业务资格。租户范围必须贯穿查找和写入，不能相信客户端自行声明。',
      '依赖注入配置负责组装实现，不负责业务判断。Spring @Transactional 是现代实现选择；它不是领域术语，也不能让远程调用自动拥有原子性。页面跨上下文汇总可以由查询编排完成，不必把所有领域模型合并。'
    ],
    example: { story: '编辑点击“结束评审”，页面随后展示结果；目录列表可能还在更新。', decision: '应用服务在本地事务中保存聚合和待投递事件；返回本轮命令结果与版本，界面区分“已结束”和“目录同步中”。', tradeoff: '下面是 Spring 风格结构片段，不是完整服务。可运行例子只验证领域模型；数据库、认证和消息协议不能用这个小例子代替。', lang: 'Java / Spring · 编排结构片段', code: `@Transactional
public FinishResult finish(FinishReview command, Actor actor) {
    access.requireEditor(actor, command.cycleId());
    var loaded = repository.get(actor.tenantId(), command.cycleId());
    var cycle = loaded.aggregate();

    cycle.finish(clock.instant());

    repository.save(cycle, loaded.version());
    outbox.appendAll(toIntegrationEvents(
        cycle.pendingEvents(), loaded.version() + 1));
    return new FinishResult(cycle.status(), loaded.version() + 1);
}
// repository 与 outbox 必须绑定同一事务资源。
// 凭据、幂等键与错误映射在相应边界实现，此片段未展开。` },
    traps: ['应用服务只能写三行代码。→ 判断标准是职责，不能按行数机械裁剪。', '领域服务负责 save，应用服务只转发。→ 会把用例事务与业务规则混在一起。'],
    task: '在一次命令失败后，客户端应如何区分权限错误、业务拒绝和并发冲突？',
    answer: '返回可区分的错误契约；权限错误不盲目重试，业务拒绝解释原因，版本冲突提示刷新或按受控策略重新评估。框架异常需在边界转换。',
    quiz: [
      { q: '“两份意见未齐，不能结束”应该由哪里最终保护？', options: ['只由前端禁用按钮', 'ReviewCycle 聚合', 'Controller 中散落的 if'], correct: 1, why: '领域不变量不能依赖某一种输入入口正确实现。' },
      { q: 'IntegrationConfiguration 一类配置的主要职责是？', options: ['替所有聚合保存数据', '决定评审是否通过', '把端口、适配器、服务和基础设施组装起来'], correct: 2, why: '组装依赖与执行业务用例是两种职责。' }
    ], sources: ['toc', 'code'], related: ['ch7', 'ch12', 'ch13']
  },
  {
    id: 'appendix', n: 'A', title: '聚合与事件溯源', en: 'Aggregates and Event Sourcing: A+ES', page: 539, group: '进阶选读', minutes: 5,
    question: '如果事件流才是事实来源，模型如何恢复与演进？',
    lead: '事件溯源通过有序事件流恢复聚合状态。它改变持久化与演进方式；并不是使用领域事件、CQRS 或审计日志后自动得到的能力。',
    topics: ['命令处理、应用服务与并发', '事件存储、读模型投影与快照', '事件契约、测试及实现选择'],
    points: [
      ['事实来源发生变化', '保存当前状态时，事件可用于通知；事件溯源中，状态由历史事件归约得到，事件流必须足够完整。'],
      ['区分决定与应用事实', '命令先检查规则，产生新事件；重放旧事件只恢复状态，不再次调用资格服务、发邮件或执行业务命令。'],
      ['演进成本不能省略', '追加时检查预期流版本；还要处理旧事件结构、投影重建、快照版本、敏感数据保留和修正历史的策略。']
    ],
    deeper: [
      '事件溯源适合确实需要解释状态如何形成、重建不同视图等场景。但不是免费审计：事件命名和粒度必须足以表达业务事实，而且历史契约会长期存在。快照只是恢复优化，不能随意替代事件事实来源。',
      '本手册主体使用状态持久化，附录才切换到事件溯源视角。实验中的时间滑块只展示归约；真实 Event Store 还要实现原子追加、预期版本检查、顺序与读写故障恢复。不要把浏览器数组理解为完整存储实现。'
    ],
    example: { story: '需要解释一轮评审为何不通过：是谁在什么时点投了什么意见，以及结束命令看到了哪些事实。', decision: '存储 RoundOpened、OpinionSubmitted、RoundCompleted，并按轮次顺序恢复状态。', tradeoff: '状态快照加审计记录也可能已满足需求。只有需要事件作为真相来源时，才承担全面事件溯源的成本。', lang: 'Java · 事件溯源流程示意', code: `var history = eventStore.read(streamId);
var cycle = ReviewCycle.replay(history.events());

var newEvents = cycle.decide(command);  // 校验规则，决定新事实

eventStore.append(streamId,
    history.version(),                 // 预期版本，冲突则失败
    newEvents);

// replay/apply 不重新发送通知，不再次调用外部 API。
// 投影消费者按自身检查点处理事件；快照用于缩短恢复时间。` },
    traps: ['Outbox 就是 Event Store。→ 存储的目的与是否能完整恢复聚合不同。', '修复历史只要 UPDATE 老事件。→ 会破坏事实链和既有投影，必须制定审计与迁移策略。'],
    task: '恢复历史时如果使用今天的资格规则重新校验旧意见，可能出现什么？',
    answer: '过去合法的事实可能因今天的规则变化而无法恢复。重放应应用已经成立的事实；规则变更需要版本化命令决策或明确的历史迁移。',
    quiz: [
      { q: '判断是否使用事件溯源，最关键的是？', options: ['数据库里有没有事件表', '是否使用 Kafka', '聚合状态是否以完整有序事件流为事实来源'], correct: 2, why: '消息存储、审计记录与事件溯源不能仅按表名判断。' },
      { q: '重放事件时是否再次发送邮件？', options: ['不应，恢复状态与副作用分开', '应，每次重放都重发', '只要使用 Spring 就会自动去重'], correct: 0, why: '重放需可重复执行，副作用必须有独立的控制和幂等策略。' }
    ], sources: ['toc', 'code'], related: ['ch4', 'ch8', 'ch10'], lab: 'replay'
  }
);

window.HANDBOOK.glossary = [
  ['通用语言', 'Ubiquitous Language', '团队在一个上下文内共同使用，并进入讨论、测试、代码的业务语言。', 'ch1'],
  ['子域', 'Subdomain', '问题空间中的一项业务能力；据战略价值区分核心、支撑、通用。', 'ch2'],
  ['核心域', 'Core Domain', '形成关键业务差异的部分，值得投入最强建模能力；不是固定不变的技术标签。', 'ch2'],
  ['限界上下文', 'Bounded Context', '某个模型与语言保持一致的适用边界。也常译作“限界上下文／界限上下文”。', 'ch2'],
  ['上下文映射', 'Context Map', '记录模型边界、协作关系与整合策略；既描述现状，也辅助改进。', 'ch3'],
  ['防腐层', 'Anti-Corruption Layer', '把外部模型转换成本地概念，保护本地语言和规则。', 'ch3'],
  ['发布语言', 'Published Language', '供上下文交换信息的明确公共语言，不等同于编程语言。', 'ch3'],
  ['六边形架构', 'Ports and Adapters', '以端口表达能力，以适配器处理外部技术，隔离系统内部逻辑。', 'ch4'],
  ['CQRS', 'Command Query Responsibility Segregation', '为修改信息与读取信息使用分离的模型／职责；可以共用数据库。', 'ch4'],
  ['实体', 'Entity', '需要跟踪持续身份与生命周期的领域对象。', 'ch5'],
  ['值对象', 'Value Object', '按属性值表达含义、通常不可变、整体替换的对象。', 'ch6'],
  ['领域服务', 'Domain Service', '有业务含义却不自然属于单一实体或值对象的操作。', 'ch7'],
  ['领域事件', 'Domain Event', '领域中已经发生且值得记录或传播的事实。', 'ch8'],
  ['集成事件', 'Integration Event', '用于跨边界传播、需要稳定契约的事件消息；是本手册采用的工程区分。', 'ch8'],
  ['Outbox', 'Transactional Outbox', '与本地状态同事务保存待投递消息，然后重试转发；不自动提供端到端恰好一次。', 'ch8'],
  ['模块', 'Module', '组织内聚业务概念并管理依赖的模型单位，可位于上下文内部。', 'ch9'],
  ['聚合', 'Aggregate', '由根统一保护业务不变量的一致性边界。', 'ch10'],
  ['不变量', 'Invariant', '在约定的一致性边界内必须始终成立的业务约束。', 'ch10'],
  ['最终一致性', 'Eventual Consistency', '允许阶段性差异，通过约定机制达到一致；需说明延迟与失败恢复责任。', 'ch10'],
  ['工厂', 'Factory', '保证创建完整有效对象的职责，可以是构造器、方法或专门服务。', 'ch11'],
  ['仓储／资源库', 'Repository', '围绕聚合取回与持久化提供的抽象；本书中文译名常为“资源库”。', 'ch12'],
  ['乐观并发控制', 'Optimistic Concurrency', '提交时验证读取以来版本未变，阻止过期状态覆盖新状态。', 'ch12'],
  ['防重复处理', 'Idempotent Consumer', '让同一消息被重复投递时不重复产生对应业务效果。', 'ch13'],
  ['应用服务', 'Application Service', '协调一次用例所需的权限、模型、事务与外部能力。', 'ch14'],
  ['事件溯源', 'Event Sourcing', '以有序事件流作为聚合状态的事实来源，重放事件恢复状态。', 'appendix'],
  ['投影', 'Projection', '从事实或状态计算面向查询的结构，可重建性取决于输入数据是否足够完整。', 'appendix']
];

window.HANDBOOK.relationships = [
  ['Partnership · 合作', '双方共同承担交付目标，协商变更与测试计划。', '双方能持续协作时'],
  ['Shared Kernel · 共享内核', '共享有限的模型或代码，修改需要双方协调。', '共享收益大于同步成本时'],
  ['Customer–Supplier · 客户供应商', '上游计划明确考虑下游需求，双方协商交付契约。', '下游具有需求协商能力时'],
  ['Conformist · 遵奉者', '下游接受上游模型，减少翻译投入。', '无影响力且语义适配成本可接受时'],
  ['ACL · 防腐层', '下游显式翻译，保护自己的模型。', '上游模型与本地语言明显不同时'],
  ['OHS · 开放主机服务', '上游提供稳定、明确的访问协议。', '需要服务多个消费者时'],
  ['Published Language · 发布语言', '使用被说明和治理的公共交换模型。', '跨团队交换信息需要共同语义时'],
  ['Separate Ways · 各行其道', '明确不整合，接受局部独立或少量重复。', '整合收益不足以覆盖成本时'],
  ['Big Ball of Mud · 大泥球', '内部含义纠缠、边界不清，需要隔离影响。', '描述遗留现状，不作为目标模式']
];
