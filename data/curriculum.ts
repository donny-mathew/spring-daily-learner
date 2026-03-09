import { CurriculumTopic } from "@/types";

export const curriculum: CurriculumTopic[] = [
  // ─── TIER 1: Fundamentals ───────────────────────────────────────────────────
  {
    id: 1,
    slug: "url-shortener",
    title: "URL Shortener",
    tier: 1,
    difficulty: "beginner",
    estimatedMinutes: 30,
    overview:
      "Design a URL shortening service like bit.ly that converts long URLs into short aliases and redirects visitors to the original URL.",
    sections: [
      {
        title: "Core Requirements",
        content:
          "Functional: given a long URL return a short alias; redirect short URL to original. Non-functional: high availability, low latency reads (< 10ms p99), 100M new URLs/day, 10:1 read-to-write ratio.",
      },
      {
        title: "ID Generation Strategy",
        content:
          "Base62 encoding (a-z, A-Z, 0-9) of a 7-character code gives 62^7 ≈ 3.5 trillion combinations. Use an atomic counter or distributed ID generator (Snowflake) converted to Base62.",
        code: `// Base62 encoding utility
private static final String BASE62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

public String encode(long id) {
    StringBuilder sb = new StringBuilder();
    while (id > 0) {
        sb.append(BASE62.charAt((int)(id % 62)));
        id /= 62;
    }
    return sb.reverse().toString();
}`,
        language: "java",
      },
      {
        title: "Storage & Caching",
        content:
          "Primary store: PostgreSQL or DynamoDB with (short_code → original_url, created_at, expiry). Cache hot URLs in Redis with TTL matching the URL expiry. Cache-aside pattern: read cache first, on miss read DB and populate cache.",
      },
      {
        title: "Spring Boot Implementation",
        content: "Use Spring Data JPA for persistence, Spring Cache + Redis for caching, Spring MVC for the redirect endpoint.",
        code: `@RestController
@RequestMapping
public class UrlController {

    @Autowired private UrlService urlService;

    @PostMapping("/shorten")
    public ResponseEntity<String> shorten(@RequestBody ShortenRequest req) {
        String code = urlService.shorten(req.getLongUrl());
        return ResponseEntity.ok("https://sho.rt/" + code);
    }

    @GetMapping("/{code}")
    public ResponseEntity<Void> redirect(@PathVariable String code) {
        String original = urlService.resolve(code);
        return ResponseEntity.status(302)
            .header("Location", original).build();
    }
}`,
        language: "java",
      },
    ],
    interviewQuestions: [
      "How would you handle hash collisions in your ID generation scheme?",
      "How do you scale the redirect service to handle 100K RPS?",
      "What happens if the Redis cache goes down? How do you ensure availability?",
      "How would you add analytics (click counts per URL) without impacting redirect latency?",
      "How would you implement custom aliases (user-chosen short codes)?",
    ],
    furtherReading: [
      { title: "System Design Interview – URL Shortener", url: "https://bytebytego.com/courses/system-design-interview/design-a-url-shortener" },
    ],
  },
  {
    id: 2,
    slug: "rate-limiter",
    title: "Rate Limiter",
    tier: 1,
    difficulty: "intermediate",
    estimatedMinutes: 35,
    overview:
      "Design a distributed rate limiter that enforces per-user or per-IP request quotas across a fleet of API servers.",
    sections: [
      {
        title: "Algorithms",
        content:
          "Token Bucket: tokens replenish at fixed rate; burst allowed. Leaky Bucket: queue smooths bursts. Fixed Window Counter: simple but allows 2× spike at window boundary. Sliding Window Log: accurate but memory-heavy. Sliding Window Counter: approximation combining fixed windows.",
      },
      {
        title: "Redis-Based Sliding Window",
        content:
          "Use a sorted set per user keyed by timestamp. ZRANGEBYSCORE to count recent requests, ZADD for new request, ZREMRANGEBYSCORE to prune old entries. Lua script ensures atomicity.",
        code: `local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)
if count < limit then
  redis.call('ZADD', key, now, now)
  redis.call('EXPIRE', key, window / 1000)
  return 1
end
return 0`,
        language: "lua",
      },
      {
        title: "Spring Boot + Resilience4j",
        content:
          "Resilience4j RateLimiter provides an in-process rate limiter. For distributed rate limiting, use a Redis Lua script via Spring Data Redis.",
        code: `@Bean
public RateLimiter apiRateLimiter(RateLimiterRegistry registry) {
    return registry.rateLimiter("api", RateLimiterConfig.custom()
        .limitForPeriod(100)
        .limitRefreshPeriod(Duration.ofSeconds(1))
        .timeoutDuration(Duration.ZERO)
        .build());
}`,
        language: "java",
      },
    ],
    interviewQuestions: [
      "Compare Token Bucket vs Sliding Window Log — when would you choose each?",
      "How do you synchronize rate limit counters across 50 API servers without a single Redis?",
      "How do you handle rate limit headers (X-RateLimit-Remaining)?",
      "What if a user abuses the system by making requests just under the limit?",
    ],
    furtherReading: [
      { title: "Designing a Rate Limiter – ByteByteGo", url: "https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter" },
    ],
  },
  {
    id: 3,
    slug: "key-value-store",
    title: "Key-Value Store",
    tier: 1,
    difficulty: "intermediate",
    estimatedMinutes: 40,
    overview:
      "Design a distributed key-value store like DynamoDB, Cassandra, or Redis — covering partitioning, replication, consistency, and failure handling.",
    sections: [
      {
        title: "Data Partitioning",
        content:
          "Consistent hashing places nodes and keys on a virtual ring. A key maps to the first node clockwise. Virtual nodes (vnodes) balance load when servers have heterogeneous capacity.",
      },
      {
        title: "Replication & Quorum",
        content:
          "Replicate each key to N successor nodes. Write quorum W, read quorum R. Strong consistency: W + R > N. Cassandra default: N=3, W=1, R=1 (eventual consistency); tunable per operation.",
      },
      {
        title: "Conflict Resolution",
        content:
          "Last-Write-Wins (LWW) uses timestamps — simple but risks data loss. Vector clocks track causality; siblings (concurrent writes) surfaced to client. Dynamo uses vector clocks + application-level resolution.",
      },
    ],
    interviewQuestions: [
      "What is consistent hashing and why is it preferred over modulo hashing for distributed systems?",
      "Explain the CAP theorem trade-offs in your design.",
      "How does DynamoDB handle hot partitions?",
      "How would you implement TTL expiration efficiently?",
    ],
    furtherReading: [
      { title: "Designing a Key-Value Store – ByteByteGo", url: "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store" },
    ],
  },
  {
    id: 4,
    slug: "consistent-hashing",
    title: "Consistent Hashing",
    tier: 1,
    difficulty: "intermediate",
    estimatedMinutes: 25,
    overview:
      "Deep-dive into consistent hashing — the algorithm powering distributed caches, load balancers, and NoSQL databases.",
    sections: [
      {
        title: "The Problem with Modulo Hashing",
        content:
          "With modulo N hashing, adding or removing a server remaps ~N/(N+1) of all keys — catastrophic for large caches. Consistent hashing remaps only K/N keys on average.",
      },
      {
        title: "The Ring",
        content:
          "Hash the key space (0 to 2^32-1) into a ring. Hash each server to a position. A key maps to the first server clockwise. Adding a server only steals keys from its successor.",
      },
      {
        title: "Virtual Nodes",
        content:
          "A single physical server is represented by multiple virtual nodes on the ring, giving fine-grained load distribution and graceful degradation when a server fails.",
        code: `TreeMap<Long, String> ring = new TreeMap<>();
// Add server with 150 virtual nodes
void addServer(String server) {
    for (int i = 0; i < 150; i++) {
        long hash = hash(server + "#" + i);
        ring.put(hash, server);
    }
}
String getServer(String key) {
    long hash = hash(key);
    Map.Entry<Long, String> entry = ring.ceilingEntry(hash);
    return entry != null ? entry.getValue() : ring.firstEntry().getValue();
}`,
        language: "java",
      },
    ],
    interviewQuestions: [
      "What is the time complexity of key lookup with consistent hashing?",
      "How many virtual nodes should you assign per server?",
      "How does consistent hashing handle server failures vs. planned removal?",
    ],
    furtherReading: [],
  },
  {
    id: 5,
    slug: "cap-theorem",
    title: "CAP Theorem",
    tier: 1,
    difficulty: "beginner",
    estimatedMinutes: 20,
    overview:
      "Understand the CAP theorem, PACELC extension, and how real distributed systems make trade-offs.",
    sections: [
      {
        title: "CAP Theorem",
        content:
          "In the presence of a network Partition, a distributed system must choose between Consistency (every read sees the latest write) and Availability (every request receives a response). CA systems (no partition tolerance) are not practical for distributed systems.",
      },
      {
        title: "PACELC",
        content:
          "Extends CAP: even when the system is running normally (no partition), there is a trade-off between Latency (faster responses with eventual consistency) and Consistency (strong guarantees at higher latency). DynamoDB, Cassandra: PA/EL. HBase, Zookeeper: PC/EC.",
      },
      {
        title: "Real-World Examples",
        content:
          "CP systems: MongoDB (primary/secondary, reads from primary only), HBase, Redis (single-node). AP systems: DynamoDB, Cassandra, CouchDB. Spring Boot apps choosing an AP data store can still implement strong consistency at the application layer for critical operations.",
      },
    ],
    interviewQuestions: [
      "Can a system be both Consistent and Available during a partition?",
      "Where does PostgreSQL fall in the CAP theorem?",
      "How does PACELC improve on CAP?",
      "Give an example where eventual consistency is acceptable and where it is not.",
    ],
    furtherReading: [],
  },
  {
    id: 6,
    slug: "rest-api-design",
    title: "REST API Design",
    tier: 1,
    difficulty: "beginner",
    estimatedMinutes: 30,
    overview:
      "Design principles for production REST APIs: resource modeling, versioning, pagination, error handling, and idempotency.",
    sections: [
      {
        title: "Resource Modeling",
        content:
          "Use nouns, not verbs. Nest related resources: /orders/{id}/items. Use plural names. POST /resources creates, PUT /resources/{id} replaces, PATCH /resources/{id} partial update, DELETE removes.",
      },
      {
        title: "Versioning",
        content:
          "URI versioning (/v1/users) is most explicit. Header versioning (Accept: application/vnd.api.v1+json) keeps URIs clean. Avoid version in query params — not cache-friendly.",
      },
      {
        title: "Pagination & Filtering",
        content:
          "Offset-based: ?page=2&size=20 — simple but inconsistent with concurrent inserts. Cursor-based: ?after=id123 — consistent, stateless. Return total count in header (X-Total-Count) or body.",
        code: `@GetMapping("/orders")
public ResponseEntity<List<OrderDto>> getOrders(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam Optional<String> status) {

    Page<Order> result = orderService.findAll(
        PageRequest.of(page, size), status);

    HttpHeaders headers = new HttpHeaders();
    headers.set("X-Total-Count", String.valueOf(result.getTotalElements()));
    return ResponseEntity.ok().headers(headers).body(mapper.toDto(result));
}`,
        language: "java",
      },
      {
        title: "Idempotency",
        content:
          "GET, PUT, DELETE are naturally idempotent. Make POST idempotent with an Idempotency-Key header — store the first response in Redis and replay it on retry, preventing duplicate payments.",
      },
    ],
    interviewQuestions: [
      "What HTTP status codes would you use for a failed validation vs. a server error?",
      "How do you handle partial failures in a batch API?",
      "What is HATEOAS and when is it useful?",
      "How do you design a REST API for a resource that doesn't map to CRUD?",
    ],
    furtherReading: [],
  },
  {
    id: 7,
    slug: "load-balancer",
    title: "Load Balancer",
    tier: 1,
    difficulty: "beginner",
    estimatedMinutes: 25,
    overview:
      "How load balancers distribute traffic, the algorithms they use, and how to design for high availability.",
    sections: [
      {
        title: "Load Balancing Algorithms",
        content:
          "Round Robin: simple, ignores server capacity. Weighted Round Robin: respects capacity. Least Connections: routes to server with fewest active connections — great for heterogeneous request durations. IP Hash: same client always goes to same server (sticky sessions without cookies).",
      },
      {
        title: "Layer 4 vs Layer 7",
        content:
          "L4 (TCP/UDP): fast, routes by IP/port only, cannot inspect HTTP. L7 (HTTP): can route by URL path, header, cookie — enables canary deployments, A/B testing, and WebSocket upgrades.",
      },
      {
        title: "Health Checks & Failover",
        content:
          "Active health checks: LB polls /health every 5s, removes unresponsive servers. Passive checks: LB monitors real traffic for 5xx responses. Spring Boot Actuator /actuator/health integrates directly.",
      },
    ],
    interviewQuestions: [
      "How would you implement sticky sessions without storing state in the load balancer?",
      "What is the difference between a load balancer and an API gateway?",
      "How do you eliminate the load balancer as a single point of failure?",
    ],
    furtherReading: [],
  },
  {
    id: 8,
    slug: "db-indexing",
    title: "DB Indexing",
    tier: 1,
    difficulty: "intermediate",
    estimatedMinutes: 35,
    overview:
      "Deep dive into B-Tree and LSM-Tree index structures, covering when to index, composite index design, and common pitfalls.",
    sections: [
      {
        title: "B-Tree Index",
        content:
          "PostgreSQL and MySQL use B-Trees for most indexes. Balanced tree with O(log n) reads and writes. Supports range queries, ORDER BY, and equality. Pages typically 8KB. Leaf nodes store pointers to heap tuples.",
      },
      {
        title: "Composite Index Design",
        content:
          "Index column order matters. For WHERE a = ? AND b = ?, index (a, b) is optimal. The leftmost prefix rule: an index on (a, b, c) can satisfy queries on a alone, or (a, b), but not b alone. High cardinality columns first.",
      },
      {
        title: "LSM-Tree (Write-Optimized)",
        content:
          "Cassandra, RocksDB, LevelDB use Log-Structured Merge Trees. Writes go to in-memory MemTable → flushed to immutable SSTable files on disk. Background compaction merges SSTables. Excellent write throughput; range reads require merging multiple files.",
      },
      {
        title: "Covering Index",
        content:
          "An index that contains all columns needed by a query avoids a heap fetch entirely. In PostgreSQL, this is achieved with INCLUDE columns. Critical for high-frequency read-heavy queries.",
      },
    ],
    interviewQuestions: [
      "Why can't you always just add more indexes?",
      "What is an index-only scan and when does it apply?",
      "How do you find missing indexes in a production PostgreSQL database?",
      "Compare B-Tree vs Hash index — when would you use a Hash index?",
    ],
    furtherReading: [],
  },
  {
    id: 9,
    slug: "caching-strategies",
    title: "Caching Strategies",
    tier: 1,
    difficulty: "intermediate",
    estimatedMinutes: 30,
    overview:
      "Cache-aside, read-through, write-through, write-behind patterns — and how to handle invalidation.",
    sections: [
      {
        title: "Cache-Aside (Lazy Loading)",
        content:
          "App checks cache; on miss, reads DB and populates cache. Most common pattern. Downside: cache miss penalty, potential thundering herd.",
        code: `@Cacheable(value = "products", key = "#id")
public Product getProduct(Long id) {
    return productRepository.findById(id)
        .orElseThrow(() -> new NotFoundException(id));
}

@CacheEvict(value = "products", key = "#product.id")
public Product updateProduct(Product product) {
    return productRepository.save(product);
}`,
        language: "java",
      },
      {
        title: "Write-Through",
        content:
          "Every write updates both cache and DB synchronously. Cache is always warm; writes are slower. Use when read latency is more critical than write latency.",
      },
      {
        title: "Write-Behind (Write-Back)",
        content:
          "Write to cache; async batch-write to DB. Highest write throughput but risk of data loss if cache fails before flush. Used in write-heavy workloads like analytics ingestion.",
      },
      {
        title: "Cache Stampede Prevention",
        content:
          "When a popular cache key expires, many requests hit DB simultaneously. Solutions: probabilistic early recomputation (recalculate before expiry with random probability), mutex locking (only one thread populates cache, others wait), or background refresh with stale-while-revalidate.",
      },
    ],
    interviewQuestions: [
      "What is the thundering herd problem and how do you solve it?",
      "How do you handle cache invalidation in a microservices architecture?",
      "When would you choose write-behind over write-through?",
      "How do you warm up a cache after a cold start?",
    ],
    furtherReading: [],
  },
  {
    id: 10,
    slug: "cdn",
    title: "CDN (Content Delivery Network)",
    tier: 1,
    difficulty: "beginner",
    estimatedMinutes: 20,
    overview:
      "How CDNs work, when to use them, and how to design origin pull vs. push strategies.",
    sections: [
      {
        title: "How CDNs Work",
        content:
          "CDN edge servers are distributed globally. Client DNS resolves to the nearest PoP (Point of Presence). On cache miss, the edge pulls from the origin and caches the response. Subsequent requests are served from the edge.",
      },
      {
        title: "Pull vs Push CDN",
        content:
          "Pull CDN: origin serves content on first request; CDN caches automatically. Simple to operate; cold start latency. Push CDN: you upload content to CDN proactively. Better for large files (videos, software downloads) with predictable access patterns.",
      },
      {
        title: "Cache-Control Headers",
        content:
          "Cache-Control: public, max-age=86400 allows CDN caching for 24h. s-maxage overrides max-age for shared caches (CDNs). Surrogate-Control is CDN-specific (Cloudflare, Fastly) and stripped before reaching the client. Vary header enables content negotiation caching.",
      },
    ],
    interviewQuestions: [
      "How do you invalidate a CDN cache for a file that was just updated?",
      "What types of content should NOT be served through a CDN?",
      "How does a CDN help with DDoS mitigation?",
    ],
    furtherReading: [],
  },
  {
    id: 11,
    slug: "sql-vs-nosql",
    title: "SQL vs NoSQL",
    tier: 1,
    difficulty: "beginner",
    estimatedMinutes: 25,
    overview:
      "When to choose relational vs. NoSQL databases — covering document, wide-column, graph, and time-series stores.",
    sections: [
      {
        title: "SQL Strengths",
        content:
          "ACID transactions, complex joins, schema enforcement, rich query language. Best for: financial systems, e-commerce, ERPs, any domain where data integrity is paramount.",
      },
      {
        title: "NoSQL Types",
        content:
          "Document (MongoDB, Firestore): flexible schema, natural fit for JSON APIs. Wide-column (Cassandra, HBase): petabyte-scale, time-series, write-heavy. Key-Value (Redis, DynamoDB): ultra-low latency lookups. Graph (Neo4j): relationships as first-class citizens (social networks, recommendations).",
      },
      {
        title: "Decision Framework",
        content:
          "Use SQL when: strong consistency required, complex multi-entity transactions, team expertise. Use NoSQL when: massive write throughput, flexible schema, horizontal scale is primary concern, data model maps naturally (e.g., user sessions → Redis, IoT events → Cassandra).",
      },
    ],
    interviewQuestions: [
      "Can you achieve ACID transactions in MongoDB? How?",
      "When would you use both SQL and NoSQL in the same system?",
      "How does DynamoDB handle transactions?",
    ],
    furtherReading: [],
  },
  {
    id: 12,
    slug: "replication-sharding",
    title: "Replication & Sharding",
    tier: 1,
    difficulty: "intermediate",
    estimatedMinutes: 35,
    overview:
      "Master-replica replication, multi-master setups, and horizontal sharding strategies for scaling databases.",
    sections: [
      {
        title: "Replication",
        content:
          "Single-leader: one write master, multiple read replicas. Synchronous replication: guarantee durability at write cost. Asynchronous: faster writes but risk of replica lag. Multi-leader: each region has a write leader; conflict resolution required.",
      },
      {
        title: "Sharding Strategies",
        content:
          "Range sharding: easy range queries but hot-key risk (e.g., all new users shard to newest shard). Hash sharding: uniform distribution but no range queries. Directory sharding: lookup service maps key → shard; flexible but single point of failure.",
      },
      {
        title: "Resharding",
        content:
          "Adding a shard requires migrating data. Strategies: consistent hashing minimizes data movement. Online resharding (Vitess, Citus): dual-write to old and new shard during migration, then cutover. Always test resharding under load.",
      },
    ],
    interviewQuestions: [
      "How does PostgreSQL logical replication work?",
      "What is replication lag and how does it affect read consistency?",
      "How do you handle cross-shard transactions?",
      "What is the difference between horizontal and vertical scaling?",
    ],
    furtherReading: [],
  },

  // ─── TIER 2: Microservices & Messaging ──────────────────────────────────────
  {
    id: 13,
    slug: "service-discovery",
    title: "Service Discovery",
    tier: 2,
    difficulty: "intermediate",
    estimatedMinutes: 30,
    overview:
      "Client-side vs. server-side service discovery, and how Spring Cloud integrates with Eureka, Consul, and Kubernetes.",
    sections: [
      {
        title: "Client-Side Discovery",
        content:
          "Service instances register with a registry (Eureka). Clients query the registry and select an instance using a client-side load balancer (Spring Cloud LoadBalancer). No extra hop, but logic in every client.",
        code: `@SpringBootApplication
@EnableEurekaClient
public class OrderService {
    public static void main(String[] args) {
        SpringApplication.run(OrderService.class, args);
    }
}`,
        language: "java",
      },
      {
        title: "Server-Side Discovery",
        content:
          "Client sends request to a router (AWS ALB, Kubernetes Service). Router queries registry and forwards to healthy instance. Simpler clients, but router is a potential bottleneck.",
      },
      {
        title: "Kubernetes-Native Discovery",
        content:
          "In Kubernetes, Services provide stable DNS names (order-service.default.svc.cluster.local). kube-proxy load balances across pods. Spring Boot apps need no discovery library — just use the Service DNS name.",
      },
    ],
    interviewQuestions: [
      "What happens when the service registry goes down in client-side discovery?",
      "How does Eureka handle network partitions (split-brain)?",
      "Compare Consul vs Eureka for service discovery.",
    ],
    furtherReading: [],
  },
  {
    id: 14,
    slug: "api-gateway",
    title: "API Gateway",
    tier: 2,
    difficulty: "intermediate",
    estimatedMinutes: 30,
    overview:
      "Design an API gateway handling routing, auth, rate limiting, and request transformation using Spring Cloud Gateway.",
    sections: [
      {
        title: "Gateway Responsibilities",
        content:
          "Routing: path-based routing to microservices. Auth: validate JWT/API key before forwarding. Rate Limiting: global or per-client limits. Request/Response Transformation: add headers, strip sensitive fields. Observability: distributed tracing injection.",
      },
      {
        title: "Spring Cloud Gateway",
        content: "Reactive, non-blocking gateway built on Spring WebFlux. Routes defined as predicates + filters in YAML or Java DSL.",
        code: `spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20`,
        language: "yaml",
      },
    ],
    interviewQuestions: [
      "What is the difference between an API gateway and a reverse proxy?",
      "How do you handle authentication in a microservices architecture with an API gateway?",
      "How would you implement request aggregation (backend for frontend pattern)?",
    ],
    furtherReading: [],
  },
  {
    id: 15,
    slug: "circuit-breaker",
    title: "Circuit Breaker",
    tier: 2,
    difficulty: "intermediate",
    estimatedMinutes: 25,
    overview:
      "Prevent cascading failures with the circuit breaker pattern using Resilience4j in Spring Boot.",
    sections: [
      {
        title: "Circuit Breaker States",
        content:
          "CLOSED: normal operation, calls pass through. OPEN: failure threshold exceeded, calls fail fast with fallback. HALF-OPEN: after wait duration, test calls allowed — if they succeed, transition to CLOSED.",
      },
      {
        title: "Resilience4j Configuration",
        code: `@CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
public PaymentResult processPayment(Order order) {
    return paymentClient.charge(order);
}

public PaymentResult paymentFallback(Order order, Exception ex) {
    // Queue for async retry or return a pending status
    outboxService.queuePayment(order);
    return PaymentResult.pending(order.getId());
}`,
        content: "Resilience4j integrates with Spring Boot Actuator to expose circuit breaker metrics and health.",
        language: "java",
      },
      {
        title: "Bulkhead Pattern",
        content:
          "Isolate failures by limiting concurrent calls to each dependency (semaphore bulkhead) or using separate thread pools (thread pool bulkhead). Prevents one slow service from exhausting all threads.",
      },
    ],
    interviewQuestions: [
      "How do you tune circuit breaker thresholds without impacting production?",
      "What is the difference between a circuit breaker and a retry?",
      "How do you test circuit breaker behavior in integration tests?",
    ],
    furtherReading: [],
  },
  {
    id: 16,
    slug: "kafka-fundamentals",
    title: "Kafka Fundamentals",
    tier: 2,
    difficulty: "intermediate",
    estimatedMinutes: 40,
    overview:
      "Core Kafka concepts: topics, partitions, offsets, consumer groups, and durability guarantees.",
    sections: [
      {
        title: "Architecture",
        content:
          "Topics are divided into partitions. Each partition is an ordered, immutable log. Producers append to partitions (round-robin or by key). Consumers in a group each own a subset of partitions — a partition is consumed by exactly one consumer per group.",
      },
      {
        title: "Delivery Semantics",
        content:
          "At-most-once: commit offset before processing — possible data loss. At-least-once: commit after processing — possible duplicates. Exactly-once: Kafka Transactions + idempotent producer. Choose based on business requirements.",
      },
      {
        title: "Retention & Compaction",
        content:
          "Time-based retention (log.retention.hours) deletes old segments. Log compaction retains the latest value per key — perfect for changelog topics (materializing state).",
      },
    ],
    interviewQuestions: [
      "How does Kafka guarantee message ordering?",
      "What happens if a consumer crashes mid-batch?",
      "How do you scale Kafka consumers beyond the number of partitions?",
      "Compare Kafka vs RabbitMQ for your use case.",
    ],
    furtherReading: [],
  },
  {
    id: 17,
    slug: "kafka-spring-boot",
    title: "Kafka + Spring Boot",
    tier: 2,
    difficulty: "intermediate",
    estimatedMinutes: 35,
    overview:
      "Practical Kafka integration in Spring Boot: producers, consumers, error handling, and dead-letter topics.",
    sections: [
      {
        title: "Producer Configuration",
        code: `@Configuration
public class KafkaProducerConfig {
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        return new DefaultKafkaProducerFactory<>(Map.of(
            ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092",
            ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class,
            ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class,
            ProducerConfig.ACKS_CONFIG, "all",           // strongest durability
            ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true
        ));
    }
}`,
        content: "acks=all waits for all in-sync replicas; idempotence=true prevents duplicate messages on retry.",
        language: "java",
      },
      {
        title: "Consumer with Error Handling",
        code: `@KafkaListener(topics = "orders", groupId = "order-processor")
public void consume(Order order, Acknowledgment ack) {
    try {
        orderService.process(order);
        ack.acknowledge();
    } catch (RecoverableException e) {
        // Will retry via SeekToCurrentErrorHandler
        throw e;
    }
}

@Bean
public DefaultErrorHandler errorHandler(KafkaTemplate<?, ?> template) {
    DeadLetterPublishingRecoverer recoverer =
        new DeadLetterPublishingRecoverer(template);
    return new DefaultErrorHandler(recoverer,
        new FixedBackOff(1000L, 3)); // 3 retries, 1s apart
}`,
        content: "Dead-letter topics (DLT) capture poison-pill messages for manual inspection without blocking the consumer.",
        language: "java",
      },
    ],
    interviewQuestions: [
      "How do you implement exactly-once processing with Spring Kafka?",
      "What is a dead-letter topic and when do you use it?",
      "How do you monitor consumer lag in production?",
    ],
    furtherReading: [],
  },
  {
    id: 18,
    slug: "saga-pattern",
    title: "SAGA Pattern",
    tier: 2,
    difficulty: "advanced",
    estimatedMinutes: 40,
    overview:
      "Manage distributed transactions across microservices without 2PC using the SAGA pattern.",
    sections: [
      {
        title: "Choreography vs Orchestration",
        content:
          "Choreography: each service emits events that trigger the next step. Decoupled, but hard to track global state. Orchestration: a central saga orchestrator sends commands and handles failures. Easier to reason about, but orchestrator is a central dependency.",
      },
      {
        title: "Compensating Transactions",
        content:
          "Each step must have a compensating transaction to undo its effects on failure. e.g., OrderCreated → PaymentCharged → InventoryReserved. If InventoryReserved fails, compensate PaymentCharged (refund) and OrderCreated (cancel).",
      },
      {
        title: "Implementation with Temporal or Axon",
        content:
          "Axon Framework provides SAGA support with @SagaEventHandler and @StartSaga annotations. State is automatically persisted between steps.",
        code: `@Saga
public class OrderSaga {
    @Autowired @Transient
    private transient CommandGateway commandGateway;

    @StartSaga
    @SagaEventHandler(associationProperty = "orderId")
    public void on(OrderCreatedEvent event) {
        commandGateway.send(new ChargePaymentCommand(event.getOrderId(), event.getAmount()));
    }

    @SagaEventHandler(associationProperty = "orderId")
    public void on(PaymentFailedEvent event) {
        commandGateway.send(new CancelOrderCommand(event.getOrderId()));
        SagaLifecycle.end();
    }
}`,
        language: "java",
      },
    ],
    interviewQuestions: [
      "How do you handle idempotency in SAGA steps?",
      "What is the difference between SAGA and 2PC?",
      "How do you debug a failed SAGA in production?",
    ],
    furtherReading: [],
  },
  {
    id: 19,
    slug: "cqrs",
    title: "CQRS",
    tier: 2,
    difficulty: "advanced",
    estimatedMinutes: 35,
    overview:
      "Command Query Responsibility Segregation — separate read and write models for performance and scalability.",
    sections: [
      {
        title: "Core Concept",
        content:
          "The write model (command side) is optimized for business logic and consistency. The read model (query side) is optimized for the specific views needed by the UI — often denormalized, precomputed projections stored in a read-optimized store (e.g., Redis, Elasticsearch).",
      },
      {
        title: "When to Use CQRS",
        content:
          "Use when read and write loads are asymmetric (10:1 or more), when different teams own read vs. write, or when the domain has complex commands with multiple side effects. Avoid for simple CRUD — the complexity is not worth it.",
      },
      {
        title: "CQRS with Spring + Axon",
        code: `// Command Side
@CommandHandler
public Order(CreateOrderCommand cmd) {
    AggregateLifecycle.apply(new OrderCreatedEvent(cmd.getOrderId(), cmd.getItems()));
}

// Query Side (projection)
@EventHandler
public void on(OrderCreatedEvent event, @Timestamp Instant timestamp) {
    orderSummaryRepo.save(new OrderSummary(event.getOrderId(), "CREATED", timestamp));
}`,
        content: "Axon Framework handles event routing between command and query sides, with built-in event sourcing support.",
        language: "java",
      },
    ],
    interviewQuestions: [
      "What is eventual consistency in the context of CQRS?",
      "How do you handle a query that needs data that hasn't been projected yet?",
      "Can you combine CQRS with a traditional RDBMS?",
    ],
    furtherReading: [],
  },
  {
    id: 20,
    slug: "event-sourcing",
    title: "Event Sourcing",
    tier: 2,
    difficulty: "advanced",
    estimatedMinutes: 40,
    overview:
      "Store state as a sequence of immutable events rather than current state — enabling full audit trails and temporal queries.",
    sections: [
      {
        title: "Core Concept",
        content:
          "Instead of UPDATE orders SET status='PAID', store a PaymentReceivedEvent. The current state is derived by replaying all events. Benefits: full audit trail, temporal queries ('what was the order state at 2pm?'), easy event-driven integrations.",
      },
      {
        title: "Snapshots",
        content:
          "Replaying all events for long-lived aggregates is expensive. Snapshots periodically capture the current state; replay only starts from the latest snapshot. Snapshot every N events or after N minutes.",
      },
      {
        title: "Event Schema Evolution",
        content:
          "Events are immutable once written. Handle schema changes with: upcasting (transform old events on read), versioning (OrderCreatedEventV2 alongside V1), or weak schema (JSON with optional fields).",
      },
    ],
    interviewQuestions: [
      "What are the downsides of event sourcing?",
      "How do you delete user data (GDPR) in an event-sourced system?",
      "How do you handle events that are published out of order?",
    ],
    furtherReading: [],
  },
  {
    id: 21,
    slug: "transactional-outbox",
    title: "Transactional Outbox",
    tier: 2,
    difficulty: "advanced",
    estimatedMinutes: 30,
    overview:
      "Reliably publish events to Kafka/RabbitMQ alongside database writes without distributed transactions.",
    sections: [
      {
        title: "The Dual-Write Problem",
        content:
          "Writing to DB and publishing to Kafka are two separate operations. If the app crashes between them, either the DB write or the event publication is lost — causing inconsistency.",
      },
      {
        title: "Outbox Pattern",
        content:
          "Write the domain entity AND the outbox event in the same local DB transaction. A separate relay process (or Debezium CDC) reads the outbox table and publishes to Kafka. At-least-once delivery — consumers must be idempotent.",
        code: `@Transactional
public Order createOrder(CreateOrderRequest req) {
    Order order = orderRepository.save(new Order(req));
    // Same transaction — atomic!
    outboxRepository.save(new OutboxEvent(
        "OrderCreated",
        objectMapper.writeValueAsString(new OrderCreatedEvent(order))
    ));
    return order;
}`,
        language: "java",
      },
      {
        title: "Debezium CDC Relay",
        content:
          "Debezium monitors the PostgreSQL WAL (Write-Ahead Log) and streams outbox table changes to Kafka automatically — no polling required, minimal latency, resilient to application restarts.",
      },
    ],
    interviewQuestions: [
      "What is the difference between the transactional outbox pattern and change data capture?",
      "How do you guarantee idempotent consumers with the outbox pattern?",
      "What are the operational overhead trade-offs of using Debezium?",
    ],
    furtherReading: [],
  },
  {
    id: 22,
    slug: "distributed-transactions",
    title: "Distributed Transactions",
    tier: 2,
    difficulty: "advanced",
    estimatedMinutes: 35,
    overview:
      "Two-phase commit, three-phase commit, and why modern distributed systems prefer SAGAs and outbox patterns instead.",
    sections: [
      {
        title: "Two-Phase Commit (2PC)",
        content:
          "Phase 1 (Prepare): coordinator asks all participants to prepare and vote. Phase 2 (Commit/Abort): if all voted yes, coordinator sends Commit; otherwise Abort. Blocking protocol — if coordinator crashes after Prepare, participants are stuck holding locks.",
      },
      {
        title: "Three-Phase Commit (3PC)",
        content:
          "Adds a pre-commit phase to reduce blocking. Still not partition-tolerant. Rarely used in practice due to complexity.",
      },
      {
        title: "Modern Alternatives",
        content:
          "SAGA Pattern: business-level compensating transactions. Transactional Outbox + CDC: reliable event publishing. These avoid distributed locks entirely at the cost of eventual consistency.",
      },
    ],
    interviewQuestions: [
      "Why is 2PC rarely used in modern microservices?",
      "What is the difference between ACID and BASE?",
      "How does Kafka Transactions provide exactly-once semantics?",
    ],
    furtherReading: [],
  },
  {
    id: 23,
    slug: "event-driven-architecture",
    title: "Event-Driven Architecture",
    tier: 2,
    difficulty: "intermediate",
    estimatedMinutes: 30,
    overview:
      "Design systems where components communicate via events — enabling loose coupling, scalability, and resilience.",
    sections: [
      {
        title: "Event Types",
        content:
          "Event Notification: signals something happened (lightweight, no data). Event-Carried State Transfer: includes all data needed by consumers (reduces coupling to producer). Domain Event: business-meaningful occurrence (OrderPlaced, PaymentFailed).",
      },
      {
        title: "Event Schema Management",
        content:
          "Use a schema registry (Confluent Schema Registry with Avro, or Apicurio with JSON Schema) to enforce backward/forward compatibility. Spring Cloud Schema Registry integrates with Spring Kafka.",
      },
      {
        title: "Ordering Guarantees",
        content:
          "Kafka guarantees order within a partition. Partition by aggregate ID (e.g., orderId) to ensure all events for one entity are ordered. Cross-entity ordering requires event sequencing at the consumer.",
      },
    ],
    interviewQuestions: [
      "What is the difference between an event and a message?",
      "How do you handle event schema evolution without breaking consumers?",
      "What is event streaming vs. event queuing?",
    ],
    furtherReading: [],
  },
  {
    id: 24,
    slug: "bulkhead",
    title: "Bulkhead Pattern",
    tier: 2,
    difficulty: "intermediate",
    estimatedMinutes: 20,
    overview:
      "Isolate failures by partitioning resources so that a failure in one component doesn't cascade to others.",
    sections: [
      {
        title: "Thread Pool Bulkhead",
        content:
          "Assign a dedicated thread pool to each downstream dependency. If the payment service is slow, only its thread pool is exhausted — the inventory service thread pool remains available.",
      },
      {
        title: "Semaphore Bulkhead",
        content:
          "Limit concurrent calls using a semaphore rather than a thread pool. Lower overhead, but doesn't protect against slow blocking calls (the caller thread is still consumed).",
        code: `@Bulkhead(name = "paymentService", type = Bulkhead.Type.THREADPOOL,
         fallbackMethod = "paymentFallback")
public CompletableFuture<PaymentResult> processPaymentAsync(Order order) {
    return CompletableFuture.supplyAsync(() -> paymentClient.charge(order));
}`,
        language: "java",
      },
    ],
    interviewQuestions: [
      "What is the difference between a bulkhead and a circuit breaker?",
      "How do you size thread pool bulkheads in production?",
      "Can a bulkhead and circuit breaker be used together?",
    ],
    furtherReading: [],
  },
  {
    id: 25,
    slug: "retry-backoff",
    title: "Retry & Backoff",
    tier: 2,
    difficulty: "intermediate",
    estimatedMinutes: 20,
    overview:
      "Design retry strategies with exponential backoff and jitter to recover from transient failures without causing thundering herd.",
    sections: [
      {
        title: "Exponential Backoff with Jitter",
        content:
          "Base retry interval doubles each attempt: 1s, 2s, 4s, 8s, 16s. Cap at max (e.g., 60s). Add random jitter to spread out retries from multiple clients — prevents synchronized storms.",
      },
      {
        title: "Resilience4j Retry",
        code: `@Retry(name = "inventoryService", fallbackMethod = "inventoryFallback")
public InventoryResult checkInventory(String sku) {
    return inventoryClient.check(sku);
}

# application.yml
resilience4j.retry:
  instances:
    inventoryService:
      maxAttempts: 3
      waitDuration: 500ms
      enableExponentialBackoff: true
      exponentialBackoffMultiplier: 2
      retryExceptions:
        - java.io.IOException
        - feign.RetryableException`,
        language: "yaml",
        content: "Only retry on transient exceptions (network timeouts, 5xx). Never retry on 4xx client errors — they won't succeed.",
      },
    ],
    interviewQuestions: [
      "What is the difference between retry and circuit breaker? When should they be combined?",
      "How do you prevent retry storms (thundering herd) in a microservices cluster?",
      "What types of errors should NOT be retried?",
    ],
    furtherReading: [],
  },
  {
    id: 26,
    slug: "distributed-locking",
    title: "Distributed Locking",
    tier: 2,
    difficulty: "advanced",
    estimatedMinutes: 30,
    overview:
      "Coordinate exclusive access to shared resources across distributed services using Redis Redlock, database advisory locks, and ZooKeeper.",
    sections: [
      {
        title: "Redis Redlock",
        content:
          "Acquire a lock on N/2+1 Redis nodes with a TTL. Release by deleting the key only if the value matches (Lua script ensures atomicity). Highly debated — Martin Kleppmann argues Redlock is unsafe under certain failure modes.",
        code: `// Using Redisson (Spring Boot)
@Autowired RRedissonClient redisson;

RLock lock = redisson.getLock("inventory-lock:" + sku);
if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {
    try {
        // critical section
        inventoryService.deduct(sku, qty);
    } finally {
        lock.unlock();
    }
}`,
        language: "java",
      },
      {
        title: "Database Advisory Locks",
        content:
          "PostgreSQL pg_try_advisory_lock(key) — session-scoped, held until released or session ends. No extra infrastructure. Best for batch jobs where DB is already involved.",
      },
    ],
    interviewQuestions: [
      "What is a split-brain scenario in distributed locking?",
      "What is a fencing token and why is it important?",
      "Compare ZooKeeper vs Redis for distributed locking.",
    ],
    furtherReading: [],
  },
  {
    id: 27,
    slug: "sidecar-service-mesh",
    title: "Sidecar / Service Mesh",
    tier: 2,
    difficulty: "advanced",
    estimatedMinutes: 30,
    overview:
      "Offload cross-cutting concerns (mTLS, retries, observability) to a sidecar proxy like Envoy/Istio or Linkerd.",
    sections: [
      {
        title: "Sidecar Pattern",
        content:
          "A proxy (Envoy) is deployed alongside each service instance in the same pod. All inbound/outbound traffic passes through the proxy. The service doesn't need to implement retry, circuit breaking, or mTLS — the sidecar does it.",
      },
      {
        title: "Istio Architecture",
        content:
          "Control plane (Istiod): manages TLS certificates, distributes configuration to sidecars. Data plane (Envoy sidecars): enforce policies, collect telemetry. Spring Boot apps gain mTLS, retries, and distributed tracing with zero code changes.",
      },
      {
        title: "Trade-offs",
        content:
          "Benefits: language-agnostic, uniform policy enforcement, richer observability. Drawbacks: extra latency per hop (~1ms), operational complexity, sidecar resource overhead, steep learning curve.",
      },
    ],
    interviewQuestions: [
      "What is mTLS and how does Istio automate it?",
      "When would you NOT use a service mesh?",
      "How does Istio's traffic management enable canary deployments?",
    ],
    furtherReading: [],
  },
  {
    id: 28,
    slug: "config-management",
    title: "Config Management",
    tier: 2,
    difficulty: "intermediate",
    estimatedMinutes: 25,
    overview:
      "Externalize and manage configuration at scale using Spring Cloud Config, Kubernetes ConfigMaps, and secrets management.",
    sections: [
      {
        title: "Spring Cloud Config Server",
        content:
          "Serves configuration from a Git repository. Applications fetch config on startup and optionally refresh without restart using Spring Cloud Bus (Kafka or RabbitMQ broadcast).",
        code: `# bootstrap.yml
spring:
  application:
    name: order-service
  config:
    import: "optional:configserver:http://config-server:8888"
  cloud:
    config:
      fail-fast: true
      retry:
        max-attempts: 6`,
        language: "yaml",
      },
      {
        title: "Kubernetes ConfigMaps & Secrets",
        content:
          "Mount ConfigMaps as environment variables or files. Secrets are base64-encoded (not encrypted by default — use sealed-secrets or Vault). Spring Boot automatically reads environment variables as properties.",
      },
      {
        title: "HashiCorp Vault",
        content:
          "Centralized secrets store with dynamic credentials (DB passwords rotated automatically), fine-grained access control, and audit logging. Spring Vault integrates via spring-cloud-vault-config.",
      },
    ],
    interviewQuestions: [
      "How do you refresh configuration without restarting a Spring Boot application?",
      "What is the difference between a ConfigMap and a Secret in Kubernetes?",
      "How do you manage secrets rotation with Vault?",
    ],
    furtherReading: [],
  },

  // ─── TIER 3: Advanced Systems ────────────────────────────────────────────────
  {
    id: 29,
    slug: "distributed-cache",
    title: "Distributed Cache",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 35,
    overview:
      "Design a distributed caching layer using Redis Cluster — covering data structures, eviction policies, and cluster topology.",
    sections: [
      {
        title: "Redis Data Structures",
        content:
          "Strings: simple K/V. Hashes: user sessions, object fields. Lists: queues, activity feeds. Sorted Sets: leaderboards, rate limiting. HyperLogLog: approximate cardinality counting. Streams: event log with consumer groups.",
      },
      {
        title: "Eviction Policies",
        content:
          "LRU (Least Recently Used): evict oldest accessed keys. LFU (Least Frequently Used): evict least-accessed keys — better for skewed access. allkeys-lru is safe default. volatile-* variants only evict keys with TTL set.",
      },
      {
        title: "Redis Cluster",
        content:
          "16384 hash slots distributed across nodes. Keys mapped to slots via CRC16. Each master has 1+ replicas. Automatic failover via Redis Sentinel or built-in cluster consensus. Spring Data Redis auto-discovers cluster topology.",
      },
    ],
    interviewQuestions: [
      "How do you implement a leaderboard with Redis?",
      "What is the difference between Redis persistence modes (RDB vs AOF)?",
      "How does Redis Cluster handle resharding?",
      "What is a hot key problem and how do you solve it in Redis?",
    ],
    furtherReading: [],
  },
  {
    id: 30,
    slug: "time-series-db",
    title: "Time-Series Database",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 30,
    overview:
      "Design a time-series data store for metrics, IoT, and monitoring use cases — comparing InfluxDB, TimescaleDB, and Prometheus.",
    sections: [
      {
        title: "Time-Series Characteristics",
        content:
          "Append-only writes (no updates), queries always include a time range, high cardinality (many label combinations), retention policies (delete data older than 30 days automatically), downsampling (1s → 1m → 1h roll-ups).",
      },
      {
        title: "Storage Optimization",
        content:
          "Delta encoding: store differences between consecutive timestamps. XOR compression for float values (Gorilla compression used by Prometheus). LSM-Tree optimized for write throughput. TimescaleDB uses PostgreSQL hypertables with automatic time-based partitioning.",
      },
      {
        title: "Spring Boot Observability",
        content:
          "Micrometer + Prometheus: @Timed, Counter, Gauge annotations. Actuator /actuator/prometheus endpoint scraped by Prometheus. Grafana for visualization. InfluxDB via Micrometer InfluxMeterRegistry.",
        code: `@Bean
MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
    return registry -> registry.config()
        .commonTags("application", "order-service",
                    "region", "us-east-1");
}`,
        language: "java",
      },
    ],
    interviewQuestions: [
      "How does Prometheus differ from InfluxDB in data model and query language?",
      "What is cardinality and why does high cardinality hurt Prometheus performance?",
      "How do you implement alerting with Prometheus AlertManager?",
    ],
    furtherReading: [],
  },
  {
    id: 31,
    slug: "search-system",
    title: "Search System",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 40,
    overview:
      "Design a full-text search system like Elasticsearch — covering inverted indexes, relevance scoring, and Spring Data Elasticsearch.",
    sections: [
      {
        title: "Inverted Index",
        content:
          "Maps each unique word → list of documents containing it. Includes term frequency (TF) and positions for phrase search. Analysis pipeline: tokenization → lowercasing → stop word removal → stemming.",
      },
      {
        title: "Relevance: BM25",
        content:
          "BM25 scores documents by term frequency (saturated — repeated words give diminishing returns) and inverse document frequency (rare words score higher). Better than TF-IDF for modern search.",
      },
      {
        title: "Spring Data Elasticsearch",
        code: `@Document(indexName = "products")
public class Product {
    @Id private String id;
    @Field(type = FieldType.Text, analyzer = "english")
    private String name;
    @Field(type = FieldType.Keyword)
    private String category;
}

public interface ProductSearchRepo
    extends ElasticsearchRepository<Product, String> {
    List<Product> findByNameContaining(String query);
}`,
        content: "Spring Data Elasticsearch 5.x requires Elasticsearch 8.x. Use RestHighLevelClient for complex query DSL.",
        language: "java",
      },
    ],
    interviewQuestions: [
      "How would you design type-ahead search?",
      "What is the difference between filter and query context in Elasticsearch?",
      "How do you keep Elasticsearch in sync with your primary database?",
      "How do you handle multi-language search?",
    ],
    furtherReading: [],
  },
  {
    id: 32,
    slug: "notification-system",
    title: "Notification System",
    tier: 3,
    difficulty: "intermediate",
    estimatedMinutes: 30,
    overview:
      "Design a multi-channel notification system (push, email, SMS, in-app) with priority queuing and delivery guarantees.",
    sections: [
      {
        title: "Architecture",
        content:
          "Notification Service receives events. Worker pool fetches from priority queues (Kafka topics by priority: high, medium, low). Channel-specific handlers (FCM for push, SES for email, Twilio for SMS). Deduplication via Redis to prevent duplicate sends.",
      },
      {
        title: "Delivery Tracking",
        content:
          "Store each notification with status (PENDING, SENT, DELIVERED, FAILED). Webhook from FCM/SES/Twilio updates delivery status. Retry FAILED notifications with exponential backoff up to 3 attempts.",
      },
      {
        title: "User Preferences",
        content:
          "Users set per-channel, per-category preferences. DND windows (Do Not Disturb). Notification digests (batch low-priority into a daily summary). Store preferences in a fast K/V store (Redis) for low-latency lookup at send time.",
      },
    ],
    interviewQuestions: [
      "How do you prevent a user from receiving the same notification twice?",
      "How would you handle 10 million push notifications in 5 minutes?",
      "How do you track notification open rates?",
    ],
    furtherReading: [],
  },
  {
    id: 33,
    slug: "news-feed",
    title: "News Feed (Social)",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 40,
    overview:
      "Design a social media news feed like Twitter/Instagram — covering fan-out strategies and the hybrid approach for celebrities.",
    sections: [
      {
        title: "Fan-Out on Write (Push)",
        content:
          "When a user posts, pre-compute and push the post to all followers' feed caches. Feed reads are O(1) — just read from cache. Problem: celebrities with millions of followers make writes extremely expensive.",
      },
      {
        title: "Fan-Out on Read (Pull)",
        content:
          "No pre-computation. When a user opens their feed, fetch recent posts from all followed users and merge. Simpler, scales well for celebrities but read latency is high.",
      },
      {
        title: "Hybrid Approach",
        content:
          "Fan-out on write for regular users (< 1K followers). Fan-out on read for celebrities (> 1K followers). On feed read, merge pre-computed feed with real-time celebrity posts. Used by Twitter, Instagram.",
      },
    ],
    interviewQuestions: [
      "How do you rank posts in a feed (beyond chronological)?",
      "How do you implement infinite scroll pagination for a feed?",
      "How do you handle a celebrity who gains 1M followers overnight?",
    ],
    furtherReading: [],
  },
  {
    id: 34,
    slug: "real-time-chat",
    title: "Real-Time Chat",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 40,
    overview:
      "Design a real-time messaging system like WhatsApp/Slack using WebSockets, message persistence, and delivery receipts.",
    sections: [
      {
        title: "WebSocket Architecture",
        content:
          "Long-lived TCP connection per client. Chat servers maintain in-memory maps of userId → WebSocket connection. When user A sends to user B: server A receives the message, stores it in DB, then routes to server B (via Kafka or Redis Pub/Sub) which pushes to B's WebSocket.",
        code: `@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").withSockJS();
    }
}`,
        language: "java",
      },
      {
        title: "Message Persistence",
        content:
          "Store messages in Cassandra (wide-column, ordered by time, append-only). Partition key: (channelId), clustering key: (timestamp, messageId). Efficient range queries for loading chat history.",
      },
      {
        title: "Delivery Receipts",
        content:
          "Sent: stored in DB. Delivered: recipient's WebSocket connection acknowledged receipt. Read: user opens the chat. Double/triple checkmarks (WhatsApp-style). Track per-message, per-recipient in a status table.",
      },
    ],
    interviewQuestions: [
      "How do you handle message delivery when a user is offline?",
      "How does Slack handle message threading?",
      "How do you scale WebSocket servers to millions of concurrent connections?",
    ],
    furtherReading: [],
  },
  {
    id: 35,
    slug: "distributed-job-scheduler",
    title: "Distributed Job Scheduler",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 35,
    overview:
      "Design a distributed cron/job scheduler supporting delayed tasks, recurring jobs, and fault tolerance — like Quartz or SQS with delay.",
    sections: [
      {
        title: "Architecture",
        content:
          "Job Store: persists job definitions and next-execution-time in a DB. Scheduler: distributed leader election (ZooKeeper or DB row lock) determines which node fires jobs. Worker Pool: executes jobs, reports success/failure.",
      },
      {
        title: "Quartz Scheduler in Spring Boot",
        code: `@Component
public class ReportJob implements Job {
    @Override
    public void execute(JobExecutionContext context) {
        reportService.generate();
    }
}

@Bean
public JobDetail reportJobDetail() {
    return JobBuilder.newJob(ReportJob.class)
        .withIdentity("report-job")
        .storeDurably().build();
}

@Bean
public Trigger reportTrigger(JobDetail reportJobDetail) {
    return TriggerBuilder.newTrigger()
        .forJob(reportJobDetail)
        .withSchedule(CronScheduleBuilder.cronSchedule("0 0 8 * * ?"))
        .build();
}`,
        language: "java",
      },
      {
        title: "Delayed Task Queue",
        content:
          "For one-off delayed tasks (send email in 1 hour): use Redis ZSET with score = execution timestamp. Poll the ZSET for tasks whose score ≤ now. SQS DelayQueue is a managed alternative.",
      },
    ],
    interviewQuestions: [
      "How do you prevent duplicate execution of a job in a clustered scheduler?",
      "How do you handle a job that takes longer than its scheduled interval?",
      "What is the difference between a job scheduler and a message queue?",
    ],
    furtherReading: [],
  },
  {
    id: 36,
    slug: "file-storage",
    title: "File Storage System",
    tier: 3,
    difficulty: "intermediate",
    estimatedMinutes: 30,
    overview:
      "Design a distributed file storage system like S3 — covering chunk storage, metadata, and resumable uploads.",
    sections: [
      {
        title: "Architecture",
        content:
          "Metadata Service: stores file metadata (name, size, chunks, owner) in a relational DB. Chunk Servers: store fixed-size (e.g., 64MB) chunks identified by content hash (SHA-256). Deduplication: chunks with the same hash are stored once.",
      },
      {
        title: "Upload Flow",
        content:
          "Client → API Server: create upload session, get presigned chunk URLs. Client → Chunk Servers: upload chunks in parallel. Client → API Server: complete upload, server assembles chunk list in metadata.",
      },
      {
        title: "Spring Boot + MinIO/S3",
        code: `@Service
public class FileService {
    @Autowired private S3Client s3;

    public String generatePresignedUploadUrl(String key) {
        PutObjectPresignRequest req = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(10))
            .putObjectRequest(r -> r.bucket("uploads").key(key))
            .build();
        return s3Presigner.presignPutObject(req).url().toString();
    }
}`,
        language: "java",
      },
    ],
    interviewQuestions: [
      "How do you implement resumable uploads?",
      "How does S3 achieve 11 nines durability?",
      "How would you implement file deduplication?",
    ],
    furtherReading: [],
  },
  {
    id: 37,
    slug: "payment-system",
    title: "Payment System",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 45,
    overview:
      "Design a payment processing system emphasizing idempotency, exactly-once semantics, and reconciliation.",
    sections: [
      {
        title: "Idempotency",
        content:
          "Every payment request includes a client-generated idempotency key. Server stores (key → result) in DB. On duplicate request, return the stored result without reprocessing. Keys expire after 24h.",
      },
      {
        title: "Double-Entry Ledger",
        content:
          "Every financial transaction creates two ledger entries: debit from source account, credit to destination. Balance = sum of all credits - sum of all debits. Immutable ledger enables reconciliation and audit.",
      },
      {
        title: "Reconciliation",
        content:
          "Daily job compares internal ledger with PSP (Payment Service Provider) settlement reports. Discrepancies trigger alerts. Implement retry with exponential backoff for failed PSP calls — but NEVER retry on success confirmation.",
      },
    ],
    interviewQuestions: [
      "How do you handle a payment that times out — did it succeed or fail?",
      "What is the importance of idempotency keys in payment systems?",
      "How do you handle currency conversion and rounding errors?",
      "How would you design a wallet system?",
    ],
    furtherReading: [],
  },
  {
    id: 38,
    slug: "ride-sharing-backend",
    title: "Ride-Sharing Backend",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 45,
    overview:
      "Design the core backend for a ride-sharing platform: driver matching, real-time location tracking, and surge pricing.",
    sections: [
      {
        title: "Location Tracking",
        content:
          "Drivers send GPS coordinates every 4s via WebSocket or MQTT. Store in Redis GEO (geospatial sorted set). GEORADIUS to find drivers within X km. Archive location history to Cassandra for trip replay.",
      },
      {
        title: "Driver Matching",
        content:
          "Segment map into hexagonal cells (Uber H3). Each cell has an in-memory set of available drivers. Matching service queries neighboring cells in expanding rings until enough drivers found. ETA estimated via road network graph (Dijkstra or A*).",
      },
      {
        title: "Surge Pricing",
        content:
          "Calculate supply/demand ratio per cell per time window. Apply surge multiplier: if demand > 2× supply, multiply base fare by 1.5×. ML models predict demand spikes from historical patterns, events, weather.",
      },
    ],
    interviewQuestions: [
      "How do you handle GPS drift and spurious location updates?",
      "How do you match a driver to multiple concurrent ride requests?",
      "How would you implement ETA prediction?",
    ],
    furtherReading: [],
  },
  {
    id: 39,
    slug: "observability",
    title: "Observability (OTel + Micrometer)",
    tier: 3,
    difficulty: "intermediate",
    estimatedMinutes: 35,
    overview:
      "Implement the three pillars of observability — logs, metrics, and traces — in Spring Boot using OpenTelemetry and Micrometer.",
    sections: [
      {
        title: "Three Pillars",
        content:
          "Logs: structured event records (use JSON with correlation IDs). Metrics: numeric measurements over time (latency, error rates, throughput). Traces: end-to-end request flows across services (distributed tracing).",
      },
      {
        title: "Spring Boot Setup",
        code: `# pom.xml dependencies
io.micrometer:micrometer-tracing-bridge-otel
io.opentelemetry:opentelemetry-exporter-otlp
io.micrometer:micrometer-registry-prometheus

# application.yml
management:
  tracing:
    sampling:
      probability: 1.0
  otlp:
    tracing:
      endpoint: http://jaeger:4318/v1/traces`,
        language: "yaml",
      },
      {
        title: "Structured Logging with Correlation",
        content:
          "Use Logback with JSON encoder. Spring Boot auto-injects traceId and spanId from Micrometer Tracing into MDC. Include userId, requestId, orderId as MDC fields for cross-service correlation.",
      },
    ],
    interviewQuestions: [
      "What is the difference between metrics and logs?",
      "How do you implement distributed tracing across 10 microservices?",
      "What is tail-based vs head-based sampling in distributed tracing?",
      "How do you create alerts from metrics in Prometheus + AlertManager?",
    ],
    furtherReading: [],
  },
  {
    id: 40,
    slug: "multi-tenancy",
    title: "Multi-Tenancy",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 35,
    overview:
      "Design a multi-tenant SaaS application using database-per-tenant, schema-per-tenant, or row-level security approaches.",
    sections: [
      {
        title: "Isolation Models",
        content:
          "Silo (DB per tenant): maximum isolation, easiest compliance, expensive to operate. Bridge (schema per tenant): shared DB, separate schemas, good balance. Pool (shared schema + tenantId column): lowest cost, cross-tenant data leakage risk if queries are wrong.",
      },
      {
        title: "Row-Level Security (PostgreSQL)",
        content:
          "PostgreSQL RLS enforces tenant isolation at the DB engine level — even a buggy query can't return another tenant's data. Set app.current_tenant context variable, add RLS policy on all tables.",
        code: `ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON orders
    USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- In Spring Boot (before each request)
entityManager.createNativeQuery(
    "SET LOCAL app.current_tenant = '" + tenantId + "'"
).executeUpdate();`,
        language: "sql",
      },
      {
        title: "Spring Boot Multi-Tenancy",
        content:
          "AbstractRoutingDataSource: route to the correct DataSource based on tenant context. Hibernate multi-tenancy with TenantIdentifierResolver. Store tenant context in a ThreadLocal set by a request filter.",
      },
    ],
    interviewQuestions: [
      "How do you handle tenant onboarding in a schema-per-tenant model?",
      "How does row-level security differ from application-level tenant filtering?",
      "How do you implement cross-tenant analytics without mixing data?",
    ],
    furtherReading: [],
  },
  {
    id: 41,
    slug: "eventual-consistency",
    title: "Eventual Consistency",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 30,
    overview:
      "Design systems that tolerate eventual consistency — including conflict resolution, compensating actions, and read-your-writes.",
    sections: [
      {
        title: "Consistency Models",
        content:
          "Strong: reads always see latest write. Sequential: all processes see the same order of operations. Causal: causally related operations appear in order. Eventual: if no new writes, all replicas converge. Monotonic read: once you read a value, you never see an older value.",
      },
      {
        title: "Read-Your-Writes",
        content:
          "After writing, route subsequent reads to the primary until replication catches up, OR use a version token (write version returned to client, reads include version, wait until replica is at that version).",
      },
      {
        title: "CRDTs",
        content:
          "Conflict-free Replicated Data Types automatically merge concurrent updates without coordination. Counter CRDT: sum of increments from each node. Last-Write-Wins Register: timestamp-based. Used in Riak, Redis, collaborative editing.",
      },
    ],
    interviewQuestions: [
      "Give a real example where eventual consistency caused a production bug.",
      "How do you implement monotonic reads in DynamoDB?",
      "What is the difference between eventual and strong consistency for inventory management?",
    ],
    furtherReading: [],
  },
  {
    id: 42,
    slug: "deployment-strategies",
    title: "Deployment Strategies",
    tier: 3,
    difficulty: "intermediate",
    estimatedMinutes: 25,
    overview:
      "Blue-green, canary, rolling, and feature flag deployments — and how to implement zero-downtime deploys in Kubernetes.",
    sections: [
      {
        title: "Blue-Green",
        content:
          "Run two identical environments (blue = current, green = new). Switch traffic instantly via load balancer or DNS update. Instant rollback by switching back. Requires 2× infrastructure during deploy.",
      },
      {
        title: "Canary Deployment",
        content:
          "Route a small percentage (1%, 5%, 10%) of traffic to the new version. Monitor error rates and latency. Gradually increase if healthy. Rollback by routing 0% to canary. Istio and Argo Rollouts support this natively.",
      },
      {
        title: "Kubernetes Rolling Update",
        content:
          "Default Kubernetes deployment strategy. Replaces pods one-by-one. maxSurge: number of extra pods during rollout. maxUnavailable: pods allowed to be down. Readiness probes ensure traffic only routes to healthy pods.",
        code: `strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10`,
        language: "yaml",
      },
    ],
    interviewQuestions: [
      "How do you handle database schema changes with blue-green deployments?",
      "What is the difference between a canary and a feature flag?",
      "How do you implement zero-downtime database migrations?",
    ],
    furtherReading: [],
  },
  {
    id: 43,
    slug: "zero-downtime-db-migration",
    title: "Zero-Downtime DB Migration",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 35,
    overview:
      "Safely evolve database schemas in production without downtime using expand-contract and Flyway/Liquibase.",
    sections: [
      {
        title: "Expand-Contract Pattern",
        content:
          "Expand: add new column/table alongside old (old code still works). Migrate: backfill data to new column; deploy new code writing to both. Contract: once all instances use new code, remove old column. Requires multiple deploy cycles — never one big bang migration.",
      },
      {
        title: "Flyway in Spring Boot",
        code: `-- V1__Add_email_column.sql (expand)
ALTER TABLE users ADD COLUMN email_new VARCHAR(255);

-- V2__Backfill_email.sql (migrate — run as online operation)
UPDATE users SET email_new = email WHERE email_new IS NULL;

-- V3__Make_email_not_null.sql (contract)
ALTER TABLE users ALTER COLUMN email_new SET NOT NULL;
ALTER TABLE users DROP COLUMN email;
ALTER TABLE users RENAME COLUMN email_new TO email;`,
        language: "sql",
      },
      {
        title: "Large Table Migrations",
        content:
          "Never run ALTER TABLE on a large table in production — it locks the table. Use pg_repack (PostgreSQL) or pt-online-schema-change (MySQL) to rebuild the table online. For backfills, batch in small chunks with sleep to avoid replication lag.",
      },
    ],
    interviewQuestions: [
      "What is the expand-contract pattern?",
      "How do you add a NOT NULL column to a 100M row table without downtime?",
      "How do you roll back a database migration?",
    ],
    furtherReading: [],
  },
  {
    id: 44,
    slug: "grpc-design",
    title: "gRPC Design",
    tier: 3,
    difficulty: "advanced",
    estimatedMinutes: 30,
    overview:
      "Design high-performance inter-service communication using gRPC with Protocol Buffers in Spring Boot.",
    sections: [
      {
        title: "gRPC vs REST",
        content:
          "gRPC uses HTTP/2 (multiplexing, header compression) + Protocol Buffers (binary serialization). 5-10× smaller payload, 2-3× faster than JSON REST. Strongly typed contracts via .proto files. Better for internal service-to-service communication.",
      },
      {
        title: "Proto Definition",
        code: `syntax = "proto3";
package order;

service OrderService {
    rpc CreateOrder (CreateOrderRequest) returns (Order);
    rpc StreamOrderUpdates (OrderId) returns (stream OrderStatus);
}

message CreateOrderRequest {
    string customer_id = 1;
    repeated OrderItem items = 2;
}

message Order {
    string id = 1;
    string status = 2;
    google.protobuf.Timestamp created_at = 3;
}`,
        language: "protobuf",
      },
      {
        title: "Spring Boot gRPC",
        content:
          "Use grpc-spring-boot-starter (yidongnan). Annotate service implementations with @GrpcService. Client stubs are injected with @GrpcClient. Deadlines, interceptors, and TLS configured in application.yml.",
      },
    ],
    interviewQuestions: [
      "What are the four types of gRPC streaming?",
      "How do you handle backward compatibility with Protocol Buffers?",
      "When would you choose gRPC over REST?",
      "How do you implement authentication in gRPC?",
    ],
    furtherReading: [],
  },

  // ─── TIER 4: Spring AI & Modern Java ────────────────────────────────────────
  {
    id: 45,
    slug: "spring-ai-architecture",
    title: "Spring AI Architecture",
    tier: 4,
    difficulty: "intermediate",
    estimatedMinutes: 35,
    overview:
      "Core Spring AI architecture — ChatClient, models, advisors, and how to integrate LLMs into Spring Boot apps.",
    sections: [
      {
        title: "Core Abstractions",
        content:
          "ChatClient: fluent API for prompt construction and response handling. ChatModel: model-specific implementation (OpenAI, Anthropic, Ollama). Prompt: system + user messages. Options: model parameters (temperature, maxTokens).",
        code: `@Service
public class AssistantService {
    private final ChatClient chatClient;

    public AssistantService(ChatClient.Builder builder) {
        this.chatClient = builder
            .defaultSystem("You are a helpful Spring Boot expert.")
            .build();
    }

    public String ask(String question) {
        return chatClient.prompt()
            .user(question)
            .call()
            .content();
    }
}`,
        language: "java",
      },
      {
        title: "Advisors",
        content:
          "Advisors intercept and modify requests/responses around the ChatClient. MessageChatMemoryAdvisor adds conversation history. QuestionAnswerAdvisor implements RAG by querying a vector store before sending to the LLM.",
      },
      {
        title: "Structured Output",
        content:
          "ChatClient can map LLM responses directly to Java objects using .entity(MyClass.class). Uses a BeanOutputConverter with JSON schema instructions injected into the prompt automatically.",
      },
    ],
    interviewQuestions: [
      "What is the difference between a ChatClient and a ChatModel in Spring AI?",
      "How do advisors enable cross-cutting concerns like memory and RAG?",
      "How do you switch between different LLM providers in Spring AI?",
    ],
    furtherReading: [
      { title: "Spring AI Reference Documentation", url: "https://docs.spring.io/spring-ai/reference/" },
    ],
  },
  {
    id: 46,
    slug: "rag-pipeline",
    title: "RAG Pipeline",
    tier: 4,
    difficulty: "advanced",
    estimatedMinutes: 40,
    overview:
      "Build a Retrieval-Augmented Generation pipeline in Spring AI — from document ingestion to vector search to LLM synthesis.",
    sections: [
      {
        title: "RAG Architecture",
        content:
          "Ingest: split documents into chunks → embed with an embedding model → store in vector DB. Retrieve: embed user query → similarity search in vector DB → get top-K chunks. Augment: inject chunks into LLM prompt. Generate: LLM produces grounded response.",
      },
      {
        title: "Document Ingestion",
        code: `@Bean
public ApplicationRunner ingestDocuments(
        VectorStore vectorStore,
        EmbeddingModel embeddingModel) {
    return args -> {
        var loader = new PdfDocumentReaderConfig.Builder()
            .withPageExtractedTextFormatter(new ExtractedTextFormatter.Builder()
                .withNumberOfTopPagesToSkipBeforeDelete(1)
                .build())
            .build();
        var docs = new PagePdfDocumentReader("classpath:docs.pdf", loader)
            .get();
        var splitter = new TokenTextSplitter();
        vectorStore.add(splitter.apply(docs));
    };
}`,
        language: "java",
      },
      {
        title: "QuestionAnswerAdvisor",
        code: `ChatClient chatClient = builder
    .defaultAdvisors(new QuestionAnswerAdvisor(vectorStore,
        SearchRequest.defaults().withTopK(5)))
    .build();

String answer = chatClient.prompt()
    .user("What are Spring Boot's main features?")
    .call().content();`,
        language: "java",
      },
    ],
    interviewQuestions: [
      "What is chunking strategy and how does chunk size affect RAG quality?",
      "How do you evaluate RAG pipeline quality?",
      "What is hybrid search (dense + sparse) and when do you need it?",
      "How do you handle multi-document RAG with different access permissions?",
    ],
    furtherReading: [],
  },
  {
    id: 47,
    slug: "vector-database",
    title: "Vector Database",
    tier: 4,
    difficulty: "advanced",
    estimatedMinutes: 35,
    overview:
      "How vector databases work — approximate nearest neighbor search, HNSW index, and comparing pgvector, Pinecone, and Weaviate.",
    sections: [
      {
        title: "Embeddings & Similarity",
        content:
          "Embeddings are dense float vectors (768 to 3072 dimensions) representing semantic meaning. Cosine similarity: angle between vectors. Dot product: directional similarity. Euclidean distance: magnitude-sensitive. Cosine is most common for text.",
      },
      {
        title: "HNSW (Hierarchical NSW)",
        content:
          "Multi-layer graph for approximate nearest neighbor (ANN) search. Top layers: coarse-grained, long-range edges. Bottom layers: fine-grained, local edges. Search starts from a random top-layer entry point, greedily descend to nearest neighbors. O(log n) search, O(n log n) build.",
      },
      {
        title: "pgvector with Spring AI",
        code: `# application.yml
spring:
  ai:
    vectorstore:
      pgvector:
        index-type: hnsw
        distance-type: cosine_distance
        dimensions: 1536   # OpenAI text-embedding-ada-002
        initialize-schema: true`,
        language: "yaml",
      },
    ],
    interviewQuestions: [
      "What is the difference between exact KNN and approximate ANN?",
      "How does product quantization reduce vector storage?",
      "When would you choose pgvector over a dedicated vector DB?",
      "How do you handle vector index updates in a high-write system?",
    ],
    furtherReading: [],
  },
  {
    id: 48,
    slug: "llm-orchestration",
    title: "LLM Orchestration",
    tier: 4,
    difficulty: "advanced",
    estimatedMinutes: 40,
    overview:
      "Build agentic LLM systems with tool calling, multi-step reasoning chains, and Spring AI's agent support.",
    sections: [
      {
        title: "Tool Calling",
        content:
          "LLMs can call functions defined by the developer. Spring AI @Tool annotation exposes Java methods to the model. The model decides when and how to call tools based on the user's request.",
        code: `@Service
public class WeatherTools {

    @Tool(description = "Get current weather for a city")
    public WeatherInfo getWeather(String city) {
        return weatherApi.fetch(city);
    }
}

// In ChatClient
chatClient.prompt()
    .user("What should I wear in Tokyo today?")
    .tools(weatherTools)
    .call().content();`,
        language: "java",
      },
      {
        title: "Multi-Step Agents",
        content:
          "ReAct pattern: Reason about what to do → Act (call tool) → Observe result → repeat. Spring AI's ChatClient in a loop with tool results fed back as messages implements a basic agent.",
      },
      {
        title: "Prompt Engineering",
        content:
          "System prompt: sets persona and constraints. Few-shot examples: demonstrate expected behavior with input/output pairs. Chain-of-thought: ask the model to reason step-by-step before answering. Output format instructions: JSON schema in system prompt.",
      },
    ],
    interviewQuestions: [
      "What is the difference between a chain and an agent in LLM orchestration?",
      "How do you prevent an agent from running indefinitely (infinite loops)?",
      "How do you evaluate agent quality?",
      "What are the security concerns with tool calling (prompt injection)?",
    ],
    furtherReading: [],
  },
  {
    id: 49,
    slug: "reactive-spring",
    title: "Reactive Spring",
    tier: 4,
    difficulty: "advanced",
    estimatedMinutes: 40,
    overview:
      "Build non-blocking reactive applications with Spring WebFlux, Project Reactor, and R2DBC.",
    sections: [
      {
        title: "Reactive Basics",
        content:
          "Mono<T>: 0 or 1 item. Flux<T>: 0 to N items. Operators: map, flatMap, filter, zip, merge. Backpressure: downstream signals how many items it can handle — prevents overwhelming slow consumers.",
      },
      {
        title: "WebFlux REST Controller",
        code: `@RestController
@RequestMapping("/orders")
public class OrderController {

    @GetMapping("/{id}")
    public Mono<Order> getOrder(@PathVariable String id) {
        return orderService.findById(id)
            .switchIfEmpty(Mono.error(new NotFoundException(id)));
    }

    @GetMapping("/stream")
    public Flux<Order> streamOrders() {
        return orderService.streamAll()
            .delayElements(Duration.ofMillis(100));
    }
}`,
        language: "java",
      },
      {
        title: "When to Use Reactive",
        content:
          "Use WebFlux for: high concurrency with many concurrent I/O-bound operations, streaming responses (SSE, WebSocket), Spring AI streaming chat. Avoid for: CPU-bound work, simple CRUD with low concurrency — blocking is simpler and easier to debug.",
      },
    ],
    interviewQuestions: [
      "What is the difference between concurrency and parallelism in Project Reactor?",
      "How do you handle errors in a reactive pipeline?",
      "What is schedulerOn vs publishOn?",
      "How do you mix blocking code in a reactive pipeline?",
    ],
    furtherReading: [],
  },
  {
    id: 50,
    slug: "spring-security-oauth2",
    title: "Spring Security + OAuth2",
    tier: 4,
    difficulty: "advanced",
    estimatedMinutes: 40,
    overview:
      "Secure Spring Boot APIs with OAuth2, JWT tokens, and Spring Security's resource server configuration.",
    sections: [
      {
        title: "OAuth2 Flows",
        content:
          "Authorization Code + PKCE: browser-based apps. Client Credentials: machine-to-machine. On-Behalf-Of (Token Exchange): service A exchanges its token for a token to call service B. Never use Implicit flow — deprecated.",
      },
      {
        title: "Spring Security Resource Server",
        code: `@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(
                    jwtAuthenticationConverter())));
        return http.build();
    }
}`,
        language: "java",
      },
      {
        title: "JWT Validation",
        content:
          "Spring Security validates JWT signature (JWKS endpoint), expiry, issuer, and audience automatically. Extract custom claims (tenantId, roles) via JwtAuthenticationConverter.",
      },
    ],
    interviewQuestions: [
      "What is the difference between OAuth2 and OpenID Connect?",
      "How do you invalidate a JWT before its expiry?",
      "How do you propagate the security context across async operations?",
      "What is PKCE and why is it required for public clients?",
    ],
    furtherReading: [],
  },
  {
    id: 51,
    slug: "spring-batch",
    title: "Spring Batch",
    tier: 4,
    difficulty: "intermediate",
    estimatedMinutes: 35,
    overview:
      "Build robust batch processing jobs with Spring Batch — readers, processors, writers, chunk processing, and fault tolerance.",
    sections: [
      {
        title: "Core Concepts",
        content:
          "Job: a batch execution unit with a name and parameters. Step: a single processing phase. Chunk-Oriented Processing: read N items → process each → write the chunk. Tasklet: a single arbitrary operation (e.g., send an email after batch completes).",
        code: `@Bean
public Step processOrdersStep(JobRepository jobRepository,
        PlatformTransactionManager tm) {
    return new StepBuilder("processOrders", jobRepository)
        .<Order, ProcessedOrder>chunk(100, tm)
        .reader(orderReader())
        .processor(orderProcessor())
        .writer(orderWriter())
        .faultTolerant()
        .skipLimit(10)
        .skip(ParseException.class)
        .build();
}`,
        language: "java",
      },
      {
        title: "Fault Tolerance",
        content:
          "Skip: skip bad records up to a limit (e.g., malformed CSV rows). Retry: retry a failed item N times before skipping or failing. Restart: if a job fails, restart from the last committed chunk using JobRepository metadata.",
      },
    ],
    interviewQuestions: [
      "How does Spring Batch handle restartability?",
      "What is the difference between a skip and a retry?",
      "How do you run Spring Batch jobs in parallel (partitioned steps)?",
      "How do you schedule a Spring Batch job with Spring Scheduler vs Quartz?",
    ],
    furtherReading: [],
  },
  {
    id: 52,
    slug: "virtual-threads",
    title: "Virtual Threads (Project Loom)",
    tier: 4,
    difficulty: "intermediate",
    estimatedMinutes: 30,
    overview:
      "Java 21 Virtual Threads — how they work, how to enable them in Spring Boot, and when they replace reactive programming.",
    sections: [
      {
        title: "How Virtual Threads Work",
        content:
          "Virtual threads are user-mode threads scheduled by the JVM, not the OS. Hundreds of thousands can exist simultaneously. When a virtual thread blocks (I/O, sleep), the JVM parks it and frees the carrier (OS) thread for another virtual thread — zero OS-level blocking.",
      },
      {
        title: "Spring Boot + Virtual Threads",
        code: `# application.yml — Spring Boot 3.2+
spring:
  threads:
    virtual:
      enabled: true`,
        language: "yaml",
      },
      {
        title: "Virtual Threads vs Reactive",
        content:
          "Virtual threads enable blocking-style code with reactive throughput. No more flatMap chains, no scheduler confusion. However: pinning (synchronized blocks or native methods) blocks the carrier thread — avoid in hot paths. Reactive is still better for back-pressure control and streaming.",
      },
    ],
    interviewQuestions: [
      "What is thread pinning and why is it a problem with virtual threads?",
      "Can you use virtual threads with JDBC? What are the limitations?",
      "Compare virtual threads to reactive programming for a simple REST API.",
      "What Java version introduced virtual threads as a stable feature?",
    ],
    furtherReading: [],
  },
  {
    id: 53,
    slug: "graalvm-native",
    title: "GraalVM Native Image",
    tier: 4,
    difficulty: "advanced",
    estimatedMinutes: 35,
    overview:
      "Compile Spring Boot applications to native executables with GraalVM — achieving sub-second startup and reduced memory.",
    sections: [
      {
        title: "How Native Image Works",
        content:
          "Ahead-of-time (AOT) compilation analyzes reachable code from entry points (closed-world assumption), compiles to native machine code. Reflection, dynamic proxies, and classpath scanning must be declared upfront via configuration hints.",
      },
      {
        title: "Spring AOT Processing",
        content:
          "Spring Boot 3.x includes AOT engine that processes Spring context at build time — generating source code, proxy classes, and native hints. Eliminates most reflection usage automatically.",
        code: `<!-- pom.xml — build native image -->
<plugin>
  <groupId>org.graalvm.buildtools</groupId>
  <artifactId>native-maven-plugin</artifactId>
  <configuration>
    <imageName>order-service</imageName>
    <metadataRepository>
      <enabled>true</enabled>
    </metadataRepository>
  </configuration>
</plugin>

# Build: ./mvnw -Pnative native:compile
# Run:   ./target/order-service`,
        language: "xml",
      },
      {
        title: "Trade-offs",
        content:
          "Benefits: ~50ms startup (vs 3-5s JVM), 10× lower memory footprint, no JIT warm-up. Drawbacks: build time 3-10 minutes, debugging harder, some libraries require additional hints, profile-guided optimizations not available.",
      },
    ],
    interviewQuestions: [
      "Why is reflection problematic for GraalVM native image?",
      "When would you choose native image over traditional JVM deployment?",
      "How does Spring Boot 3.x improve native image compatibility?",
      "What is the closed-world assumption in GraalVM?",
    ],
    furtherReading: [],
  },
  {
    id: 54,
    slug: "adrs",
    title: "Architecture Decision Records (ADRs)",
    tier: 4,
    difficulty: "beginner",
    estimatedMinutes: 20,
    overview:
      "Document architectural decisions with ADRs — capturing context, decision, and consequences to preserve institutional knowledge.",
    sections: [
      {
        title: "ADR Format",
        content:
          "Title: short noun phrase (ADR-001: Use PostgreSQL for primary persistence). Status: Proposed | Accepted | Deprecated | Superseded. Context: problem being solved. Decision: chosen approach. Consequences: trade-offs, follow-up actions.",
      },
      {
        title: "When to Write an ADR",
        content:
          "Write an ADR for decisions that: affect multiple teams, are difficult to reverse, have significant architectural impact, or where the rationale would otherwise be lost. Don't write ADRs for implementation details.",
      },
      {
        title: "ADR Tooling",
        content:
          "Store ADRs in the same repository as code (docs/adr/). Use adr-tools CLI to create and link ADRs. MkDocs or Docusaurus for publishing. Architectural fitness functions (ArchUnit in Spring) to enforce decisions as tests.",
        code: `// ArchUnit: enforce ADR-002 (no direct DB access from controllers)
@Test
public void controllers_should_not_access_repositories() {
    noClasses().that().resideInAPackage("..controller..")
        .should().accessClassesThat().resideInAPackage("..repository..")
        .check(importedClasses);
}`,
        language: "java",
      },
    ],
    interviewQuestions: [
      "What is the difference between an ADR and a design document?",
      "How do you handle an ADR that becomes outdated?",
      "How do you get team buy-in for writing ADRs?",
    ],
    furtherReading: [],
  },
  {
    id: 55,
    slug: "system-design-interview-framework",
    title: "System Design Interview Framework",
    tier: 4,
    difficulty: "intermediate",
    estimatedMinutes: 30,
    overview:
      "A structured framework for acing system design interviews — from requirements gathering to back-of-envelope estimation to component deep-dives.",
    sections: [
      {
        title: "Step 1: Clarify Requirements (5 min)",
        content:
          "Functional: what does the system do? (core features only). Non-functional: scale (DAU, RPS, data volume), latency targets (p99), consistency requirements, availability SLA (99.9% = 8.7h downtime/year). Don't design until requirements are clear.",
      },
      {
        title: "Step 2: Back-of-Envelope Estimation (5 min)",
        content:
          "QPS: 100M users × 10 actions/day ÷ 86400s ≈ 12,000 RPS peak. Storage: 100M users × 1KB profile = 100GB. Bandwidth: 12K RPS × 1KB = 12MB/s. These guide component selection and scaling decisions.",
      },
      {
        title: "Step 3: High-Level Design (10 min)",
        content:
          "Draw: clients, CDN, load balancers, API gateway, services, DB, cache, message queue. State the data model. Identify the read/write path for the most critical operation. Don't over-engineer — get agreement on the overall shape before details.",
      },
      {
        title: "Step 4: Deep Dive (25 min)",
        content:
          "Pick 2-3 areas to go deep based on interviewer interest: scalability bottlenecks, consistency guarantees, failure handling, data access patterns. Always say 'I would choose X because Y — the trade-off is Z.' Show you know trade-offs, not just facts.",
      },
    ],
    interviewQuestions: [
      "Walk me through how you approach a system design question you've never seen before.",
      "How do you decide what to go deep on in a system design interview?",
      "What are the most common mistakes candidates make in system design interviews?",
      "How do you handle it when the interviewer keeps expanding the requirements?",
    ],
    furtherReading: [
      { title: "System Design Interview Vol 1 — Alex Xu", url: "https://bytebytego.com" },
    ],
  },
];

export const getCurriculumBySlug = (slug: string): CurriculumTopic | undefined =>
  curriculum.find((t) => t.slug === slug);

export const getTierTopics = (tier: number): CurriculumTopic[] =>
  curriculum.filter((t) => t.tier === tier);
