import java.time.Instant;
import java.util.*;

/**
 * 手册原创的领域模型练习，Java 21，零第三方依赖。
 * 运行：java examples/ReviewExample.java
 * 内存仓储仅演示版本语义，不实现数据库事务、认证或消息投递。
 */
public class ReviewExample {
    record TenantId(String value) {
        TenantId { requireText(value); }
    }
    record ReviewCycleId(String value) {
        ReviewCycleId { requireText(value); }
    }
    record DocumentVersionId(String value) {
        DocumentVersionId { requireText(value); }
    }
    record ReviewerId(String value) {
        ReviewerId { requireText(value); }
    }
    record ReviewWindow(Instant opensAt, Instant closesAt) {
        ReviewWindow {
            Objects.requireNonNull(opensAt);
            Objects.requireNonNull(closesAt);
            if (!opensAt.isBefore(closesAt)) {
                throw new IllegalArgumentException("起始时间必须早于截止时间");
            }
        }
        boolean contains(Instant now) {
            Objects.requireNonNull(now);
            return !now.isBefore(opensAt) && now.isBefore(closesAt);
        }
    }
    enum Vote { APPROVE, REJECT }
    enum Status { OPEN, ACCEPTED, REJECTED }
    record ReviewCompleted(UUID eventId, ReviewCycleId cycleId,
                           Status result, Instant occurredAt) {}

    static final class ReviewCycle {
        private final TenantId tenant;
        private final ReviewCycleId id;
        private final DocumentVersionId versionId;
        private final Set<ReviewerId> reviewerIds;
        private final ReviewWindow window;
        private final Map<ReviewerId, Vote> opinions;
        private final List<ReviewCompleted> pendingEvents = new ArrayList<>();
        private Status status;

        private ReviewCycle(TenantId tenant, ReviewCycleId id,
                            DocumentVersionId versionId, Set<ReviewerId> reviewers,
                            ReviewWindow window, Map<ReviewerId, Vote> opinions,
                            Status status) {
            this.tenant = Objects.requireNonNull(tenant);
            this.id = Objects.requireNonNull(id);
            this.versionId = Objects.requireNonNull(versionId);
            this.reviewerIds = Set.copyOf(reviewers);
            this.window = Objects.requireNonNull(window);
            this.opinions = new HashMap<>(opinions);
            this.status = Objects.requireNonNull(status);
        }

        static ReviewCycle open(TenantId tenant, ReviewCycleId id,
                                DocumentVersionId versionId, ReviewerId author,
                                List<ReviewerId> reviewers, ReviewWindow window) {
            Objects.requireNonNull(author);
            Objects.requireNonNull(reviewers);
            var unique = Set.copyOf(reviewers);
            if (reviewers.size() != 2 || unique.size() != 2) {
                throw new IllegalArgumentException("需要两位不同的审稿人");
            }
            if (unique.contains(author)) {
                throw new IllegalArgumentException("作者不能评审自己");
            }
            return new ReviewCycle(tenant, id, versionId, unique, window,
                Map.of(), Status.OPEN);
        }

        void submit(ReviewerId reviewer, Vote vote, Instant now) {
            requireOpen();
            Objects.requireNonNull(reviewer);
            Objects.requireNonNull(vote);
            if (!reviewerIds.contains(reviewer)) {
                throw new IllegalArgumentException("不是本轮指定审稿人");
            }
            if (!window.contains(now)) {
                throw new IllegalStateException("不在评审时间窗内");
            }
            if (opinions.containsKey(reviewer)) {
                throw new IllegalStateException("意见已提交，不能覆盖");
            }
            opinions.put(reviewer, vote);
        }

        public void finish(Instant now) {
            requireOpen();
            Objects.requireNonNull(now);
            if (opinions.size() != reviewerIds.size()) {
                throw new IllegalStateException("两份意见尚未齐备");
            }
            status = opinions.values().stream().allMatch(v -> v == Vote.APPROVE)
                ? Status.ACCEPTED : Status.REJECTED;
            pendingEvents.add(new ReviewCompleted(UUID.randomUUID(), id, status, now));
        }

        public void requireOpen() {
            if (status != Status.OPEN) {
                throw new IllegalStateException("本轮评审已结束");
            }
        }
        Status status() { return status; }
        Map<ReviewerId, Vote> opinions() { return Map.copyOf(opinions); }
        List<ReviewCompleted> pendingEvents() { return List.copyOf(pendingEvents); }

        // 内存快照恢复不会再产生事件，也不再次执行业务创建命令。
        private ReviewCycle persistedCopy() {
            return new ReviewCycle(tenant, id, versionId, reviewerIds,
                window, opinions, status);
        }
    }

    record Loaded<T>(T aggregate, long version) {}
    record Key(TenantId tenant, ReviewCycleId id) {}
    static final class Conflict extends RuntimeException {
        Conflict() { super("版本冲突：请重新加载并重新判断"); }
    }
    interface ReviewCycleRepository {
        Loaded<ReviewCycle> get(TenantId tenant, ReviewCycleId id);
        void save(ReviewCycle cycle, long expectedVersion);
    }
    static final class InMemoryRepository implements ReviewCycleRepository {
        private final Map<Key, Loaded<ReviewCycle>> state = new HashMap<>();
        synchronized void add(ReviewCycle cycle) {
            var key = new Key(cycle.tenant, cycle.id);
            if (state.containsKey(key)) throw new IllegalStateException("重复轮次");
            state.put(key, new Loaded<>(cycle.persistedCopy(), 0));
        }
        public synchronized Loaded<ReviewCycle> get(TenantId tenant, ReviewCycleId id) {
            var stored = state.get(new Key(tenant, id));
            if (stored == null) throw new NoSuchElementException("该租户下不存在此轮次");
            return new Loaded<>(stored.aggregate().persistedCopy(), stored.version());
        }
        public synchronized void save(ReviewCycle cycle, long expectedVersion) {
            var key = new Key(cycle.tenant, cycle.id);
            var stored = state.get(key);
            if (stored == null || stored.version() != expectedVersion) throw new Conflict();
            state.put(key, new Loaded<>(cycle.persistedCopy(), expectedVersion + 1));
        }
    }

    private static final Instant START = Instant.parse("2026-10-13T00:00:00Z");
    private static final Instant END = START.plusSeconds(3600);
    private static final TenantId TENANT = new TenantId("team-knowledge");
    private static final ReviewCycleId ID = new ReviewCycleId("round-001");
    private static final ReviewerId AUTHOR = new ReviewerId("author");
    private static final ReviewerId LI = new ReviewerId("li");
    private static final ReviewerId WANG = new ReviewerId("wang");
    private static int checks;

    static ReviewCycle fresh() {
        return ReviewCycle.open(TENANT, ID, new DocumentVersionId("doc-v3"),
            AUTHOR, List.of(LI, WANG), new ReviewWindow(START, END));
    }

    public static void main(String[] args) {
        var window = new ReviewWindow(START, END);
        check(window.equals(new ReviewWindow(START, END)), "时间窗按值相等");
        check(window.contains(START), "包含起始瞬间");
        check(window.contains(END.minusNanos(1)), "包含截止前一纳秒");
        check(!window.contains(END), "排除截止瞬间");
        expect(IllegalArgumentException.class,
            () -> new ReviewWindow(END, START), "拒绝颠倒区间");
        expect(IllegalArgumentException.class,
            () -> new ReviewWindow(START, START), "拒绝空区间");
        expect(IllegalArgumentException.class,
            () -> ReviewCycle.open(TENANT, ID, new DocumentVersionId("v1"), AUTHOR,
                List.of(LI, LI), window), "拒绝重复审稿人");
        expect(IllegalArgumentException.class,
            () -> ReviewCycle.open(TENANT, ID, new DocumentVersionId("v1"), AUTHOR,
                List.of(LI, AUTHOR), window), "拒绝作者参与评审");

        var cycle = fresh();
        expect(IllegalArgumentException.class,
            () -> cycle.submit(AUTHOR, Vote.APPROVE, START), "拒绝非指定人提交");
        expect(IllegalStateException.class,
            () -> cycle.submit(LI, Vote.APPROVE, END), "截止后不能提交");
        cycle.submit(LI, Vote.APPROVE, START);
        expect(IllegalStateException.class,
            () -> cycle.submit(LI, Vote.REJECT, START), "拒绝覆盖已有意见");
        expect(IllegalStateException.class, () -> cycle.finish(START), "意见未齐不能结束");
        check(cycle.status() == Status.OPEN && cycle.pendingEvents().isEmpty(),
            "失败命令不改变状态或产生完成事件");
        expect(UnsupportedOperationException.class,
            () -> cycle.opinions().put(WANG, Vote.APPROVE), "不泄漏可变意见集合");
        cycle.submit(WANG, Vote.APPROVE, START.plusSeconds(1));
        cycle.finish(START.plusSeconds(2));
        check(cycle.status() == Status.ACCEPTED, "两份赞成可通过");
        check(cycle.pendingEvents().size() == 1, "仅产生一次完成事实");
        expect(IllegalStateException.class, () -> cycle.finish(START.plusSeconds(3)),
            "重复结束交给用例幂等协议，不再次产生事件");

        var rejected = fresh();
        rejected.submit(LI, Vote.APPROVE, START);
        rejected.submit(WANG, Vote.REJECT, START);
        rejected.finish(START);
        check(rejected.status() == Status.REJECTED, "任一反对则不通过");

        var repo = new InMemoryRepository();
        repo.add(fresh());
        var a = repo.get(TENANT, ID);
        var b = repo.get(TENANT, ID);
        a.aggregate().submit(LI, Vote.APPROVE, START);
        b.aggregate().submit(WANG, Vote.APPROVE, START);
        repo.save(a.aggregate(), a.version());
        expect(Conflict.class, () -> repo.save(b.aggregate(), b.version()),
            "拒绝过期快照覆盖新意见");
        var retry = repo.get(TENANT, ID);
        check(retry.aggregate().opinions().containsKey(LI), "保留第一个请求的意见");
        retry.aggregate().submit(WANG, Vote.APPROVE, START);
        repo.save(retry.aggregate(), retry.version());
        check(repo.get(TENANT, ID).aggregate().opinions().size() == 2,
            "重新加载后重试可保留双方意见");
        expect(NoSuchElementException.class,
            () -> repo.get(new TenantId("other-tenant"), ID), "按租户范围查找");
        System.out.println("PASS: " + checks + " 项领域与并发语义检查。");
        System.out.println("范围：纯 Java 模型 + 内存仓储；未验证数据库、认证或消息中间件。");
    }

    static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
        checks++;
    }
    static void expect(Class<? extends Throwable> expected, Runnable action, String message) {
        try {
            action.run();
        } catch (Throwable error) {
            if (!expected.isInstance(error)) throw new AssertionError(message, error);
            checks++;
            return;
        }
        throw new AssertionError("预期失败但成功了：" + message);
    }
    static void requireText(String text) {
        if (text == null || text.isBlank()) throw new IllegalArgumentException("标识不能为空");
    }
}
