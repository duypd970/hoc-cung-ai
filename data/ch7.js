window.DSA_CHAPTERS = window.DSA_CHAPTERS || [];
window.DSA_CHAPTERS.push({
  id: "ch7",
  number: 7,
  title: "Kỹ thuật giải bài thi",
  summary: "Bộ kỹ năng ngoài bài giảng nhưng cần cho lộ trình tháng 2: ước lượng độ phức tạp theo giới hạn, STL, hashing, two pointers, sliding window, prefix sum, binary search và DP cơ bản.",
  examWeight: "Cao",
  lessons: [
    {
      id: "ch7-l1",
      title: "Đọc đề, ước lượng độ phức tạp và viết code an toàn",
      minutes: 15,
      sections: [
        {
          heading: "Từ giới hạn n suy ra thuật toán",
          body: "Máy chấm thường cho khoảng 1 giây, tương đương khoảng 10^8 phép tính đơn giản. Vì vậy, **giới hạn của n chính là gợi ý lớn nhất của đề**. Đọc xong dữ liệu vào, hãy ước lượng ngay:\n\n- n ≤ 10: chấp nhận O(n!) (sinh hoán vị, vét cạn).\n- n ≤ 20: O(2^n) hoặc O(2^n · n) (quay lui, duyệt mọi tập con, bitmask).\n- n ≤ 500: O(n^3) (ba vòng lặp lồng nhau, Floyd).\n- n ≤ 5 000 (đôi khi 10^4): O(n²) (hai vòng lặp, DP bảng 2 chiều).\n- n ≤ 10^5 đến 10^6: O(n log n) (sắp xếp, set/map, chặt nhị phân, heap).\n- n ≤ 10^7 trở lên: O(n) hoặc O(log n) (duyệt một lần, prefix sum, hai con trỏ, công thức).\n\nCách dùng: lấy độ phức tạp của cách làm đầu tiên nghĩ ra, thay n vào. Nếu vượt quá khoảng 10^8 thì phải đổi thuật toán, đừng cố 'tối ưu hằng số'.",
          complexity: "n = 10^5: O(n²) = 10^10 → quá chậm (TLE); O(n log n) ≈ 1,7·10^6 → rất nhanh"
        },
        {
          heading: "Mẫu code đọc/ghi nhanh",
          body: "Với dữ liệu lớn (hàng trăm nghìn số), `cin`/`cout` mặc định khá chậm vì đồng bộ với `stdio`. Hai dòng đầu hàm `main` dưới đây tắt đồng bộ đó. Lưu ý: sau khi tắt thì **không trộn** `cin` với `scanf`, `cout` với `printf`. Dùng `\"\\n\"` thay cho `endl` vì `endl` ép xả bộ đệm, rất chậm khi in nhiều dòng.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    vector<long long> a(n);
    long long sum = 0;
    for (auto &x : a) {
        cin >> x;
        sum += x;
    }
    cout << sum << "\n";
    return 0;
}`
        },
        {
          heading: "long long và tràn số",
          body: "`int` chứa tối đa khoảng 2,147·10^9; `long long` khoảng 9,22·10^18. Quy tắc nhanh:\n\n- Tổng của nhiều số, tích hai số cỡ 10^9, số Fibonacci, giai thừa, kết quả đếm cặp (n²/2) → dùng `long long`.\n- Lỗi kinh điển: `long long c = a * b;` với `a`, `b` kiểu `int` — phép nhân vẫn tính bằng `int` và tràn **trước khi** gán. Phải ép kiểu một toán hạng: `(long long)a * b`.\n- Khởi tạo giá trị 'vô cùng': với `int` dùng `1e9` (hoặc `INT_MAX / 2` để cộng hai INF không tràn), với `long long` dùng `4e18` hoặc `LLONG_MAX / 2`.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    int a = 100000, b = 100000;
    long long wrong = a * b;          // a*b tính bằng int -> tràn
    long long right = (long long)a * b; // 10^10
    cout << right << "\n";
    (void)wrong;
    return 0;
}`
        },
        {
          heading: "Test biên trước khi nộp",
          body: "Trước khi nộp, tự chạy thử các trường hợp 'đáy' của đề:\n\n- n = 1 (và n = 0 nếu đề cho phép).\n- Mọi phần tử bằng nhau; mảng đã sắp xếp tăng, giảm.\n- Số âm, số 0, giá trị lớn nhất theo đề (kiểm tra tràn số).\n- Không có đáp án (in -1, 0 hoặc 'NO' theo đề).\n- Chuỗi rỗng, chuỗi một ký tự.\n\nThói quen tốt: viết thêm một hàm vét cạn O(n²) chạy trên dữ liệu nhỏ để so sánh với lời giải chính."
        }
      ],
      keyPoints: [
        "Luôn nhìn giới hạn n trước khi chọn thuật toán: 20 → 2^n, 5 000 → n², 10^5-10^6 → n log n, lớn hơn → n.",
        "Ước lượng khoảng 10^8 phép tính đơn giản mỗi giây.",
        "Dùng ios::sync_with_stdio(false); cin.tie(nullptr); và '\\n' thay cho endl khi dữ liệu lớn.",
        "Tổng, tích, đếm cặp nghi ngờ vượt 2·10^9 thì dùng long long; ép kiểu trước khi nhân.",
        "Luôn thử test biên: n nhỏ nhất, giá trị lớn nhất, không có đáp án."
      ],
      pitfalls: [
        "Viết long long c = a * b với a, b là int: vẫn tràn vì phép nhân tính bằng int.",
        "Trộn cin với scanf (hoặc cout với printf) sau khi đã tắt đồng bộ sẽ cho thứ tự đọc/ghi sai.",
        "Dùng INF = INT_MAX rồi cộng thêm 1 → tràn thành số âm.",
        "Khai báo mảng cục bộ rất lớn (int a[10000000]) trong hàm gây tràn stack; khai báo toàn cục hoặc dùng vector."
      ]
    },
    {
      id: "ch7-l2",
      title: "STL cần cho thi: vector, sort, heap, set, map",
      minutes: 20,
      sections: [
        {
          heading: "vector, pair và sort với comparator",
          body: "`vector` là mảng động: truy cập `v[i]` O(1), `push_back` O(1) khấu hao, `insert`/`erase` ở giữa O(n). `pair<int,int>` so sánh theo `first` rồi tới `second`, nên sắp xếp một `vector<pair>` mặc định là tăng theo `first`.\n\n`sort(v.begin(), v.end())` có độ phức tạp O(n log n). Muốn thứ tự khác, truyền **comparator**: hàm nhận hai phần tử và trả về `true` nếu phần tử thứ nhất phải đứng **trước** phần tử thứ hai. Comparator phải là quan hệ thứ tự ngặt: dùng `<` hoặc `>`, **không** dùng `<=` hay `>=` (có thể làm chương trình crash).",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<pair<int, int>> v = {{3, 1}, {1, 5}, {3, 0}, {2, 2}};
    // giảm theo second, nếu bằng nhau thì tăng theo first
    sort(v.begin(), v.end(), [](const pair<int, int> &a, const pair<int, int> &b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });
    for (auto &p : v) cout << p.first << " " << p.second << "\n";
    return 0;
}`,
          complexity: "sort: O(n log n)"
        },
        {
          heading: "stack, queue, deque, priority_queue",
          body: "- `stack`: LIFO, `push`/`pop`/`top` đều O(1). Dùng cho ngoặc đúng, biểu thức hậu tố, khử đệ quy.\n- `queue`: FIFO, `push`/`pop`/`front` O(1). Dùng cho BFS.\n- `deque`: thêm/xoá ở **cả hai đầu** O(1) và vẫn truy cập `d[i]` O(1). Dùng cho cửa sổ trượt cực trị.\n- `priority_queue`: heap, `push`/`pop` O(log n), `top` O(1). **Mặc định là max-heap** (top là phần tử lớn nhất). Muốn min-heap: `priority_queue<int, vector<int>, greater<int>>`.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    priority_queue<int, vector<int>, greater<int>> pq; // min-heap
    for (int x : {5, 1, 8, 3}) pq.push(x);
    while (!pq.empty()) {
        cout << pq.top() << " ";   // 1 3 5 8
        pq.pop();
    }
    cout << "\n";
    return 0;
}`,
          complexity: "push/pop heap: O(log n); top: O(1)"
        },
        {
          heading: "set, map, unordered_map",
          body: "`set` (tập không trùng, có thứ tự) và `map` (khoá → giá trị, có thứ tự) cài đặt bằng cây cân bằng: `insert`, `erase`, `find`, `count`, `lower_bound` đều **O(log n)**, duyệt theo thứ tự tăng của khoá. `multiset` cho phép trùng.\n\n`unordered_set`/`unordered_map` dùng bảng băm: thao tác **trung bình O(1)**, xấu nhất O(n), nhưng **không có thứ tự**. Cần thứ tự hoặc muốn an toàn trước test chống hash → dùng `map`. Chỉ cần đếm/tra cứu nhanh → `unordered_map`.\n\nLưu ý: `m[k]` với khoá chưa có sẽ **tạo mới** phần tử giá trị 0; chỉ kiểm tra tồn tại thì dùng `m.count(k)` hoặc `m.find(k)`.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    map<string, int> cnt;
    for (string w : {"a", "b", "a", "c", "a"}) cnt[w]++;
    for (auto &[k, v] : cnt) cout << k << ": " << v << "\n";

    set<int> s = {10, 20, 30};
    auto it = s.lower_bound(15);   // phần tử đầu tiên >= 15
    cout << *it << "\n";           // 20
    return 0;
}`,
          complexity: "set/map: O(log n); unordered_*: O(1) trung bình"
        },
        {
          heading: "lower_bound / upper_bound và bảng Big-O",
          body: "Trên mảng/vector **đã sắp xếp**: `lower_bound(first, last, x)` trả về iterator tới phần tử đầu tiên **≥ x**; `upper_bound` trả về phần tử đầu tiên **> x**. Cả hai O(log n). Số lần x xuất hiện = `upper_bound - lower_bound`. Vị trí (chỉ số) = `it - v.begin()`.\n\nVới `set`/`map` hãy gọi hàm thành viên `s.lower_bound(x)` (O(log n)); hàm `std::lower_bound(s.begin(), s.end(), x)` trên set là O(n) vì iterator của set không truy cập ngẫu nhiên.\n\nBảng nhớ nhanh:\n- vector: truy cập O(1), push_back O(1)*, chèn giữa O(n).\n- deque: hai đầu O(1), truy cập O(1).\n- stack/queue: O(1) mỗi thao tác.\n- priority_queue: push/pop O(log n), top O(1).\n- set/map: mọi thao tác O(log n).\n- unordered_map/set: O(1) trung bình.\n- sort: O(n log n).",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> v = {1, 2, 2, 2, 5, 7};
    int lo = lower_bound(v.begin(), v.end(), 2) - v.begin(); // 1
    int hi = upper_bound(v.begin(), v.end(), 2) - v.begin(); // 4
    cout << "so lan xuat hien cua 2: " << hi - lo << "\n";   // 3
    return 0;
}`
        }
      ],
      keyPoints: [
        "sort O(n log n); comparator trả true nếu a phải đứng trước b, chỉ dùng < hoặc >.",
        "priority_queue mặc định là max-heap; min-heap cần greater<int>.",
        "set/map O(log n) có thứ tự; unordered_map O(1) trung bình, không có thứ tự.",
        "lower_bound = phần tử đầu tiên >= x; upper_bound = phần tử đầu tiên > x (mảng đã sắp xếp).",
        "deque cho phép thao tác hai đầu O(1) — nền tảng của cửa sổ trượt cực trị."
      ],
      pitfalls: [
        "Comparator dùng <= hoặc >= vi phạm thứ tự ngặt, có thể gây crash hoặc lặp vô hạn trong sort.",
        "m[k] tạo phần tử mới khi k chưa tồn tại — dùng count/find để chỉ kiểm tra.",
        "Gọi std::lower_bound trên set/map (O(n)) thay vì s.lower_bound (O(log n)).",
        "Gọi top()/pop() trên stack, queue, priority_queue rỗng là hành vi không xác định."
      ]
    },
    {
      id: "ch7-l3",
      title: "Hashing: bảng băm, đụng độ, đếm tần suất, two-sum",
      minutes: 18,
      sections: [
        {
          heading: "Ý tưởng bảng băm",
          body: "Bảng băm lưu cặp (khoá, giá trị) trong một mảng gồm m ô. **Hàm băm** `h(key)` biến khoá thành chỉ số `0..m-1` (ví dụ `key mod m`). Nhờ đó, tìm/thêm/xoá có thể nhảy thẳng tới ô cần thiết thay vì duyệt cả mảng: **O(1) trung bình**.\n\nVì có nhiều khoá hơn số ô nên hai khoá khác nhau có thể cho cùng một chỉ số — gọi là **đụng độ** (collision). Chất lượng bảng băm quyết định bởi cách xử lý đụng độ và độ đầy (hệ số tải α = số phần tử / m).",
          complexity: "Trung bình O(1) mỗi thao tác; xấu nhất O(n) khi mọi khoá đụng vào một ô"
        },
        {
          heading: "Hai cách xử lý đụng độ",
          body: "**Nối chuỗi (chaining):** mỗi ô chứa một danh sách liên kết (hoặc vector) các khoá có cùng chỉ số. Thêm khoá = bỏ vào danh sách của ô đó; tìm khoá = duyệt danh sách đó. Đơn giản, bảng không bao giờ 'đầy', xoá dễ.\n\n**Địa chỉ mở (open addressing):** mọi phần tử nằm ngay trong mảng. Nếu ô `h(key)` đã bị chiếm thì **dò** ô khác theo một quy tắc: dò tuyến tính `(h+1) mod m, (h+2) mod m, ...`, dò bậc hai, hoặc băm kép. Tiết kiệm bộ nhớ nhưng khi α gần 1 thì chậm hẳn, và xoá phải dùng 'cờ đã xoá' để không làm đứt chuỗi dò.\n\nSTL `unordered_map` dùng nối chuỗi và tự tăng kích thước bảng (rehash) khi α vượt ngưỡng.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

// Bảng băm đếm tần suất, xử lý đụng độ bằng nối chuỗi
struct HashTable {
    int m;
    vector<vector<pair<long long, int>>> bucket;
    HashTable(int m = 1009) : m(m), bucket(m) {}

    int h(long long key) const { return (int)(((key % m) + m) % m); }

    void add(long long key) {
        for (auto &p : bucket[h(key)])
            if (p.first == key) { p.second++; return; }
        bucket[h(key)].push_back({key, 1});
    }
    int get(long long key) const {
        for (auto &p : bucket[h(key)])
            if (p.first == key) return p.second;
        return 0;
    }
};

int main() {
    HashTable t;
    for (long long x : {5, 1014, 5, 7, 1014, 5}) t.add(x); // 5 và 1014 đụng độ (mod 1009)
    cout << t.get(5) << " " << t.get(1014) << " " << t.get(9) << "\n"; // 3 2 0
    return 0;
}`,
          complexity: "Thêm/tìm: O(1 + α) trung bình"
        },
        {
          heading: "Bài đếm tần suất và two-sum",
          body: "**Đếm tần suất:** duyệt mảng một lần, `cnt[x]++` → O(n) thay vì O(n²). Dùng kết quả để tìm phần tử xuất hiện nhiều nhất, kiểm tra trùng lặp, so sánh hai đa tập (anagram).\n\n**Two-sum:** cho mảng a và số S, tìm hai vị trí i < j sao cho a[i] + a[j] = S. Cách thô O(n²). Cách băm: duyệt j từ trái sang phải, với mỗi a[j] hỏi 'trước đó đã thấy S − a[j] chưa?' bằng bảng băm, rồi mới thêm a[j] vào bảng. Tổng O(n).\n\nCảnh báo: khi chạy trên hệ thống chấm có test chống hash, `unordered_map` có thể suy biến về O(n) mỗi thao tác. Khi n ≤ 10^6 và không cần nhanh tuyệt đối, `map` (O(log n)) là lựa chọn an toàn.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

// Trả về cặp chỉ số (0-based) i<j có a[i]+a[j]=S, hoặc {-1,-1}
pair<int, int> twoSum(const vector<long long> &a, long long S) {
    unordered_map<long long, int> seen; // giá trị -> chỉ số xuất hiện đầu tiên
    for (int j = 0; j < (int)a.size(); j++) {
        auto it = seen.find(S - a[j]);
        if (it != seen.end()) return {it->second, j};
        if (!seen.count(a[j])) seen[a[j]] = j;
    }
    return {-1, -1};
}

int main() {
    vector<long long> a = {8, 3, 5, 4, 6};
    auto r = twoSum(a, 9);
    cout << r.first << " " << r.second << "\n"; // 2 3
    return 0;
}`,
          complexity: "O(n) trung bình, bộ nhớ O(n)"
        }
      ],
      keyPoints: [
        "Bảng băm: h(key) cho chỉ số ô; thao tác O(1) trung bình, xấu nhất O(n).",
        "Đụng độ là chuyện bình thường; xử lý bằng nối chuỗi (danh sách trong mỗi ô) hoặc địa chỉ mở (dò ô khác).",
        "Hệ số tải α càng gần 1 thì địa chỉ mở càng chậm; bảng cần rehash khi quá đầy.",
        "Đếm tần suất và two-sum đều giảm từ O(n²) xuống O(n) nhờ bảng băm.",
        "Cần thứ tự hoặc sợ test chống hash → dùng map (O(log n))."
      ],
      pitfalls: [
        "Quên rằng unordered_map không có thứ tự: duyệt ra không theo khoá tăng dần.",
        "Two-sum: thêm a[j] vào bảng trước khi tra cứu sẽ ghép phần tử với chính nó (khi S = 2·a[j]).",
        "Hàm băm key % m với key âm cho chỉ số âm — cộng thêm m rồi lấy dư lần nữa.",
        "Chọn m là luỹ thừa của 2 hoặc hàm băm kém làm nhiều khoá đụng nhau; ưu tiên m là số nguyên tố."
      ]
    },
    {
      id: "ch7-l4",
      title: "Two Pointers (hai con trỏ)",
      minutes: 15,
      sections: [
        {
          heading: "Khi nào dùng hai con trỏ",
          body: "Thay vì hai vòng lặp lồng nhau O(n²), ta giữ hai chỉ số `l`, `r` và di chuyển chúng **chỉ theo một chiều**, mỗi con trỏ đi tối đa n bước → O(n). Điều kiện cốt lõi: có tính **đơn điệu** — khi di chuyển một con trỏ, ta biết chắc đáp án nào bị loại.\n\nCác dạng hay gặp:\n- **Hai đầu tiến vào nhau:** mảng đã sắp xếp, tìm cặp có tổng S, kiểm tra chuỗi đối xứng.\n- **Cùng chiều:** gộp hai mảng đã sắp xếp, xoá phần tử trùng, nén mảng, đoạn con thoả điều kiện.\n- **Nhanh – chậm:** tìm chu trình trong danh sách liên kết, tìm phần tử giữa.",
          complexity: "O(n) sau khi sắp xếp (nếu cần: O(n log n))"
        },
        {
          heading: "Cặp có tổng S trên mảng đã sắp xếp",
          body: "Đặt `l = 0`, `r = n-1`. Xét `s = a[l] + a[r]`:\n- `s == S`: tìm thấy.\n- `s < S`: cần tổng lớn hơn, mà `a[l]` ghép với bất kỳ phần tử nào ≤ `a[r]` cũng nhỏ hơn S → loại `a[l]`, tăng `l`.\n- `s > S`: loại `a[r]`, giảm `r`.\n\nChứng minh đúng nằm ở lập luận loại bỏ này; sinh viên nên tự nói được nó khi giải thích bài.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

bool hasPair(vector<int> a, int S) {
    sort(a.begin(), a.end());
    int l = 0, r = (int)a.size() - 1;
    while (l < r) {
        long long s = (long long)a[l] + a[r];
        if (s == S) return true;
        if (s < S) l++;
        else r--;
    }
    return false;
}

int main() {
    cout << hasPair({8, 3, 5, 4, 6}, 9) << " " << hasPair({1, 2, 3}, 100) << "\n"; // 1 0
    return 0;
}`,
          complexity: "O(n log n) do sắp xếp; phần hai con trỏ O(n)"
        },
        {
          heading: "Gộp hai mảng đã sắp xếp",
          body: "Hai con trỏ `i`, `j` trên hai mảng; mỗi bước lấy phần tử nhỏ hơn đưa vào kết quả rồi tiến con trỏ tương ứng. Đây chính là bước trộn của merge sort. Khi một mảng hết thì chép nốt phần còn lại.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

vector<int> mergeSorted(const vector<int> &a, const vector<int> &b) {
    vector<int> res;
    size_t i = 0, j = 0;
    while (i < a.size() && j < b.size()) {
        if (a[i] <= b[j]) res.push_back(a[i++]);
        else res.push_back(b[j++]);
    }
    while (i < a.size()) res.push_back(a[i++]);
    while (j < b.size()) res.push_back(b[j++]);
    return res;
}

int main() {
    for (int x : mergeSorted({1, 4, 9}, {2, 3, 10, 11})) cout << x << " ";
    cout << "\n";
    return 0;
}`,
          complexity: "O(n + m)"
        }
      ],
      keyPoints: [
        "Hai con trỏ biến O(n²) thành O(n) khi có tính đơn điệu để loại bỏ đáp án.",
        "Cặp có tổng S: sắp xếp, l đầu – r cuối; s < S thì tăng l, s > S thì giảm r.",
        "Gộp hai mảng đã sắp xếp: chọn phần tử nhỏ hơn rồi tiến con trỏ đó.",
        "Mỗi con trỏ chỉ đi một chiều nên tổng số bước tối đa 2n."
      ],
      pitfalls: [
        "Quên sắp xếp mảng trước khi dùng kiểu hai đầu.",
        "Điều kiện l < r viết nhầm thành l <= r làm ghép một phần tử với chính nó.",
        "Khi mảng có nhiều giá trị trùng, đếm cặp cần xử lý nhóm trùng, không chỉ tăng/giảm một bước.",
        "Cộng a[l] + a[r] bằng int có thể tràn khi giá trị cỡ 10^9."
      ]
    },
    {
      id: "ch7-l5",
      title: "Sliding Window (cửa sổ trượt)",
      minutes: 16,
      sections: [
        {
          heading: "Cửa sổ có kích thước cố định",
          body: "Bài: 'trong mọi đoạn k phần tử liên tiếp, đoạn nào có tổng lớn nhất?'. Cách thô tính lại tổng từng đoạn: O(nk). Cách trượt: giữ tổng của cửa sổ hiện tại, khi dịch sang phải **cộng phần tử mới vào, trừ phần tử vừa rời đi** → mỗi bước O(1).",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

long long maxSumK(const vector<int> &a, int k) {
    long long cur = 0, best;
    for (int i = 0; i < k; i++) cur += a[i];
    best = cur;
    for (int i = k; i < (int)a.size(); i++) {
        cur += a[i] - a[i - k];   // thêm phần tử mới, bỏ phần tử cũ
        best = max(best, cur);
    }
    return best;
}

int main() {
    cout << maxSumK({1, 4, 2, 10, 2, 3, 1, 0, 20}, 4) << "\n"; // 24
    return 0;
}`,
          complexity: "O(n)"
        },
        {
          heading: "Cửa sổ co giãn",
          body: "Khi độ dài cửa sổ không cố định, ta có hai con trỏ `l`, `r`: **mở rộng** `r` để thêm phần tử, **thu hẹp** `l` khi cửa sổ vi phạm (hoặc đã thoả) điều kiện. Mỗi con trỏ chỉ tiến, nên tổng O(n).\n\nVí dụ: đoạn con liên tiếp **ngắn nhất** có tổng ≥ S, với các phần tử **dương**. Thêm a[r] vào tổng; trong khi tổng ≥ S thì cập nhật độ dài ngắn nhất rồi bỏ a[l] và tăng l. Điều kiện 'dương' quan trọng: nó đảm bảo thêm phần tử thì tổng tăng, bỏ phần tử thì tổng giảm (tính đơn điệu).",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int shortestAtLeast(const vector<int> &a, long long S) {
    int n = a.size(), best = INT_MAX, l = 0;
    long long sum = 0;
    for (int r = 0; r < n; r++) {
        sum += a[r];
        while (sum >= S) {
            best = min(best, r - l + 1);
            sum -= a[l++];
        }
    }
    return best == INT_MAX ? 0 : best;
}

int main() {
    cout << shortestAtLeast({2, 3, 1, 2, 4, 3}, 7) << "\n"; // 2
    return 0;
}`,
          complexity: "O(n)"
        },
        {
          heading: "Dạng 'dài nhất không vi phạm'",
          body: "Mẫu thứ hai: tìm đoạn **dài nhất** thoả điều kiện. Mở rộng r; khi vi phạm thì tăng l cho đến khi hết vi phạm; cập nhật đáp án sau mỗi bước.\n\nVí dụ: xâu con dài nhất không có ký tự lặp. Dùng mảng đếm `cnt[256]`; thêm `s[r]`, nếu `cnt[s[r]] > 1` thì dịch `l` và giảm đếm cho tới khi hợp lệ.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int longestUnique(const string &s) {
    int cnt[256] = {0}, best = 0, l = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        cnt[(unsigned char)s[r]]++;
        while (cnt[(unsigned char)s[r]] > 1) {
            cnt[(unsigned char)s[l]]--;
            l++;
        }
        best = max(best, r - l + 1);
    }
    return best;
}

int main() {
    cout << longestUnique("abcabcbb") << "\n"; // 3
    return 0;
}`,
          complexity: "O(n)"
        }
      ],
      keyPoints: [
        "Cửa sổ cố định k: cộng phần tử mới, trừ phần tử cũ — mỗi bước O(1).",
        "Cửa sổ co giãn: r luôn tiến để mở rộng, l tiến để thu hẹp; tổng O(n).",
        "Ngắn nhất thoả điều kiện: cập nhật đáp án trong lúc thu hẹp. Dài nhất không vi phạm: cập nhật sau khi đã thu hẹp xong.",
        "Cần tính đơn điệu (ví dụ phần tử dương) để biết khi nào mở, khi nào thu."
      ],
      pitfalls: [
        "Dùng cửa sổ co giãn với mảng có số âm: tổng không còn đơn điệu, thuật toán sai (cần prefix sum + cấu trúc khác).",
        "Quên khởi tạo tổng cửa sổ đầu tiên (k phần tử) trước khi trượt.",
        "Dùng if thay cho while khi thu hẹp: có thể phải bỏ nhiều phần tử mới hợp lệ.",
        "Tổng cửa sổ vượt int; dùng long long."
      ]
    },
    {
      id: "ch7-l6",
      title: "Prefix Sum và mảng hiệu",
      minutes: 15,
      sections: [
        {
          heading: "Prefix sum: tổng đoạn O(1)",
          body: "Với mảng a[1..n], đặt `P[0] = 0`, `P[i] = P[i-1] + a[i]`. Khi đó **tổng đoạn [l, r] = P[r] − P[l−1]**. Xây P mất O(n); mỗi truy vấn chỉ còn O(1) thay vì O(n). Với q truy vấn: O(n + q) thay cho O(nq).\n\nDùng chỉ số từ 1 và `P[0] = 0` giúp khỏi phải xét riêng trường hợp l = 1.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> P(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        long long x;
        cin >> x;
        P[i] = P[i - 1] + x;
    }
    while (q--) {
        int l, r;
        cin >> l >> r;
        cout << P[r] - P[l - 1] << "\n";
    }
    return 0;
}`,
          complexity: "Xây O(n); mỗi truy vấn O(1)"
        },
        {
          heading: "Prefix sum + bảng băm: đếm đoạn có tổng K",
          body: "Đoạn (i, j] có tổng K khi `P[j] − P[i] = K`, tức `P[i] = P[j] − K`. Duyệt j tăng dần, giữ bảng đếm các giá trị prefix đã gặp: số đoạn kết thúc tại j bằng số lần đã thấy `P[j] − K`. Cách này đúng cả khi mảng có số âm (khác với cửa sổ trượt) và chạy O(n).",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

long long countSubarrays(const vector<int> &a, long long K) {
    unordered_map<long long, int> seen;
    seen[0] = 1;                 // prefix rỗng
    long long pref = 0, res = 0;
    for (int x : a) {
        pref += x;
        auto it = seen.find(pref - K);
        if (it != seen.end()) res += it->second;
        seen[pref]++;
    }
    return res;
}

int main() {
    cout << countSubarrays({1, 2, 1, -1, 2}, 3) << "\n"; // 3
    return 0;
}`,
          complexity: "O(n) trung bình"
        },
        {
          heading: "Mảng hiệu: cộng đoạn O(1)",
          body: "Bài toán ngược: có nhiều thao tác 'cộng v vào mọi phần tử từ l đến r' rồi mới hỏi mảng cuối cùng. Cách thô O(n) mỗi thao tác. Dùng **mảng hiệu** `D`, với `D[i] = a[i] − a[i−1]`:\n\n- Cộng v vào [l, r]: `D[l] += v; D[r+1] -= v;` (O(1)).\n- Khôi phục mảng: `a[i] = a[i−1] + D[i]` (chính là prefix sum của D).\n\nMảng hiệu và prefix sum là hai phép toán ngược nhau, giống đạo hàm và tích phân. Ý tưởng mở rộng lên 2 chiều (prefix sum 2D) dùng công thức bao hàm – loại trừ.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    int n = 5;
    vector<long long> a = {0, 1, 2, 3, 4, 5};   // a[1..5]
    vector<long long> D(n + 2, 0);
    auto add = [&](int l, int r, long long v) {
        D[l] += v;
        D[r + 1] -= v;
    };
    add(1, 3, 2);
    add(2, 5, -1);
    long long run = 0;
    for (int i = 1; i <= n; i++) {
        run += D[i];
        cout << a[i] + run << " ";   // 3 3 4 3 4
    }
    cout << "\n";
    return 0;
}`,
          complexity: "Mỗi cập nhật O(1); khôi phục O(n)"
        }
      ],
      keyPoints: [
        "P[i] = a[1] + ... + a[i], P[0] = 0; tổng [l, r] = P[r] − P[l−1].",
        "Prefix sum đưa bài nhiều truy vấn tổng đoạn từ O(nq) xuống O(n + q).",
        "Đếm đoạn có tổng K: P[j] − K đã xuất hiện bao nhiêu lần → prefix sum + bảng băm, đúng cả với số âm.",
        "Mảng hiệu: cộng v vào [l, r] bằng D[l] += v, D[r+1] -= v."
      ],
      pitfalls: [
        "Quên khai báo P[0] = 0 hoặc quên đặt seen[0] = 1 khi đếm đoạn bắt đầu từ đầu mảng.",
        "Mảng hiệu cần kích thước n + 2 vì có thao tác D[r+1] khi r = n.",
        "Dùng int cho prefix sum khi tổng có thể vượt 2·10^9.",
        "Nhầm chỉ số 0-based và 1-based khiến sai lệch một đơn vị ở đầu/cuối đoạn."
      ]
    },
    {
      id: "ch7-l7",
      title: "Binary Search patterns (chặt nhị phân)",
      minutes: 20,
      sections: [
        {
          heading: "Lower bound và upper bound tự viết",
          body: "Chặt nhị phân hoạt động trên bất cứ thứ gì 'đơn điệu': dãy giá trị `false false false true true true`. Việc cần làm là tìm **vị trí true đầu tiên**. Mẫu an toàn nhất dùng khoảng nửa mở `[lo, hi)`:\n\n- `lo = 0`, `hi = n` (hi = n nghĩa là 'không có phần tử nào thoả').\n- Trong khi `lo < hi`: `mid = lo + (hi − lo) / 2`; nếu `mid` thoả điều kiện thì `hi = mid`, ngược lại `lo = mid + 1`.\n- Kết thúc: `lo` là vị trí đầu tiên thoả (hoặc n).\n\n`lower_bound` = vị trí đầu tiên có `a[i] >= x`; `upper_bound` = vị trí đầu tiên có `a[i] > x`. Chỉ khác ở điều kiện.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int lowerBound(const vector<int> &a, int x) {   // chỉ số đầu tiên có a[i] >= x
    int lo = 0, hi = a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] >= x) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

int upperBound(const vector<int> &a, int x) {   // chỉ số đầu tiên có a[i] > x
    int lo = 0, hi = a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] > x) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

int main() {
    vector<int> a = {1, 2, 2, 2, 5, 7};
    cout << lowerBound(a, 2) << " " << upperBound(a, 2) << "\n"; // 1 4
    return 0;
}`,
          complexity: "O(log n)"
        },
        {
          heading: "Vị trí đầu, vị trí cuối, đếm số lần",
          body: "Từ hai hàm trên suy ra mọi thứ:\n- Vị trí **đầu** của x: `i = lowerBound(a, x)`; tồn tại nếu `i < n` và `a[i] == x`.\n- Vị trí **cuối** của x: `upperBound(a, x) − 1` (kiểm tra `a[...] == x`).\n- Số lần xuất hiện: `upperBound − lowerBound`.\n- Phần tử lớn nhất `< x`: `lowerBound(a, x) − 1` (nếu ≥ 0).\n\nChọn mẫu khoảng nửa mở `[lo, hi)` và dùng thống nhất một kiểu sẽ tránh được phần lớn lỗi lệch một đơn vị và vòng lặp vô hạn.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> a = {1, 2, 2, 2, 5, 7};
    int x = 2;
    int first = lower_bound(a.begin(), a.end(), x) - a.begin();
    int last = upper_bound(a.begin(), a.end(), x) - a.begin() - 1;
    if (first < (int)a.size() && a[first] == x)
        cout << first << " " << last << "\n";   // 1 3
    else
        cout << "khong co\n";
    return 0;
}`
        },
        {
          heading: "Chặt nhị phân theo đáp án",
          body: "Nhiều bài không có mảng để tìm, nhưng **đáp án** nằm trong một khoảng và có tính đơn điệu: nếu đáp án x khả thi thì mọi x' dễ hơn cũng khả thi. Khi thấy đề có dạng 'tìm giá trị **lớn nhất** thoả…' hoặc 'tìm giá trị **nhỏ nhất** thoả…', hãy nghĩ tới chặt nhị phân theo đáp án:\n\n1. Xác định khoảng đáp án [lo, hi].\n2. Viết hàm `ok(x)` kiểm tra x có khả thi không (thường O(n) bằng duyệt tham lam).\n3. Chặt nhị phân tìm biên giữa khả thi và không khả thi.\n\nTổng: O(n · log(khoảng đáp án)). Ví dụ: cắt gỗ lấy tối thiểu M mét; chia mảng thành k đoạn sao cho tổng đoạn lớn nhất nhỏ nhất; đặt k con bò vào chuồng sao cho khoảng cách nhỏ nhất lớn nhất.",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

// Tìm x lớn nhất sao cho ok(x) đúng, biết ok đơn điệu: đúng với x nhỏ, sai với x lớn.
// Giả sử ok(lo) luôn đúng.
long long searchMax(long long lo, long long hi, const function<bool(long long)> &ok) {
    while (lo < hi) {
        long long mid = lo + (hi - lo + 1) / 2;   // làm tròn lên để không lặp vô hạn
        if (ok(mid)) lo = mid;
        else hi = mid - 1;
    }
    return lo;
}

int main() {
    // Ví dụ: x lớn nhất sao cho x*x <= 1000000007
    long long ans = searchMax(0, 2000000000LL, [](long long x) { return x * x <= 1000000007LL; });
    cout << ans << "\n"; // 31622
    return 0;
}`,
          complexity: "O(log(khoảng đáp án) × chi phí ok)"
        }
      ],
      keyPoints: [
        "Dùng khoảng nửa mở [lo, hi) và mid = lo + (hi − lo)/2 để không tràn số.",
        "lower_bound: đầu tiên >= x; upper_bound: đầu tiên > x; đếm = upper − lower.",
        "Tìm giá trị lớn nhất thoả điều kiện thì mid làm tròn lên; tìm nhỏ nhất thì làm tròn xuống.",
        "Chặt nhị phân theo đáp án cần hàm kiểm tra ok(x) có tính đơn điệu.",
        "Với số thực: lặp cố định khoảng 100 lần thay vì so sánh bằng."
      ],
      pitfalls: [
        "mid = (lo + hi) / 2 tràn int khi lo, hi cỡ 10^9; dùng lo + (hi − lo)/2.",
        "Vòng lặp vô hạn khi tìm max mà tính mid làm tròn xuống (lo = mid không tiến).",
        "Chặt nhị phân trên mảng chưa sắp xếp hoặc hàm ok không đơn điệu cho kết quả vô nghĩa.",
        "Đặt khoảng đáp án quá hẹp (bỏ sót giá trị biên) hoặc quá rộng làm x·x, tổng tràn."
      ]
    },
    {
      id: "ch7-l8",
      title: "Từ đệ quy đến quy hoạch động (DP)",
      minutes: 25,
      sections: [
        {
          heading: "Nhận dạng bài DP",
          body: "Một bài thường là DP khi thoả đồng thời:\n- Hỏi **tối ưu** (nhỏ nhất, lớn nhất), **đếm** số cách, hoặc 'có/không' khả thi.\n- Bài lớn chia được thành **bài con cùng dạng**, có thể kết hợp lại (cấu trúc con tối ưu).\n- Các bài con **bị tính lặp lại** (gối nhau) khi giải đệ quy thuần.\n- Số lượng bài con khác nhau là đa thức (không bùng nổ như 2^n).\n\nQuy trình 5 bước: (1) định nghĩa trạng thái `dp[...]` nghĩa là gì; (2) viết công thức chuyển; (3) trường hợp cơ sở; (4) thứ tự tính (bài con nhỏ trước); (5) đáp án nằm ở ô nào. Bước 1 quyết định tất cả — hãy viết hẳn một câu tiếng Việt 'dp[i] là ...'.",
          complexity: "Thời gian = (số trạng thái) × (chi phí chuyển mỗi trạng thái)"
        },
        {
          heading: "Fibonacci: đệ quy → memoization → bảng",
          body: "`fib(n) = fib(n−1) + fib(n−2)`: đệ quy thuần gọi lại cùng một `fib(k)` rất nhiều lần nên O(2^n).\n\n- **Memoization (top-down):** giữ nguyên hàm đệ quy, thêm mảng nhớ; trước khi tính thì tra, tính xong thì lưu. Mỗi trạng thái tính một lần → O(n). Ưu điểm: dễ viết từ công thức, chỉ tính trạng thái cần thiết. Nhược: tốn stack đệ quy.\n- **Bảng (bottom-up):** lặp từ bài nhỏ đến lớn, điền bảng. Nhanh, không lo tràn stack, dễ tối ưu bộ nhớ (chỉ giữ hai giá trị gần nhất).",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

long long memo[100];

long long fibMemo(int n) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
}

long long fibTable(int n) {
    if (n <= 1) return n;
    long long a = 0, b = 1;            // chỉ giữ hai giá trị gần nhất
    for (int i = 2; i <= n; i++) {
        long long c = a + b;
        a = b;
        b = c;
    }
    return b;
}

int main() {
    memset(memo, -1, sizeof(memo));
    cout << fibMemo(50) << " " << fibTable(50) << "\n"; // 12586269025 12586269025
    return 0;
}`,
          complexity: "O(n) thời gian; bảng tối ưu O(1) bộ nhớ"
        },
        {
          heading: "Đổi tiền: số đồng xu ít nhất",
          body: "Cho các mệnh giá c[1..n] (mỗi loại dùng không giới hạn) và số tiền S. Tìm số đồng ít nhất để tạo đúng S.\n\n- Trạng thái: `dp[x]` = số đồng ít nhất để tạo đúng x.\n- Chuyển: `dp[x] = min over c của dp[x − c] + 1` (với `x ≥ c`).\n- Cơ sở: `dp[0] = 0`; các ô khác khởi tạo INF (chưa tạo được).\n- Đáp án: `dp[S]`, nếu còn INF thì in −1.\n\nTham lam (luôn lấy đồng lớn nhất) **không** đúng với mọi bộ mệnh giá, ví dụ {1, 3, 4} và S = 6: tham lam 4+1+1 (3 đồng) còn tối ưu 3+3 (2 đồng).",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int minCoins(const vector<int> &c, int S) {
    const int INF = 1e9;
    vector<int> dp(S + 1, INF);
    dp[0] = 0;
    for (int x = 1; x <= S; x++)
        for (int v : c)
            if (x >= v && dp[x - v] != INF)
                dp[x] = min(dp[x], dp[x - v] + 1);
    return dp[S] == INF ? -1 : dp[S];
}

int main() {
    cout << minCoins({1, 3, 4}, 6) << " " << minCoins({5}, 3) << "\n"; // 2 -1
    return 0;
}`,
          complexity: "O(S · n)"
        },
        {
          heading: "LCS: dãy con chung dài nhất",
          body: "Cho hai xâu A (dài n) và B (dài m), tìm độ dài dãy con chung dài nhất (các ký tự giữ đúng thứ tự nhưng không cần liên tiếp).\n\n- Trạng thái: `dp[i][j]` = độ dài LCS của `i` ký tự đầu của A và `j` ký tự đầu của B.\n- Nếu `A[i] == B[j]`: `dp[i][j] = dp[i−1][j−1] + 1`.\n- Ngược lại: `dp[i][j] = max(dp[i−1][j], dp[i][j−1])`.\n- Cơ sở: `dp[0][*] = dp[*][0] = 0`. Đáp án `dp[n][m]`.\n\nĐây là mẫu cho cả họ bài về xâu và dãy: khoảng cách chỉnh sửa (edit distance), dãy con tăng dài nhất, cái túi…",
          code: String.raw`#include <bits/stdc++.h>
using namespace std;

int lcs(const string &A, const string &B) {
    int n = A.size(), m = B.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            if (A[i - 1] == B[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    return dp[n][m];
}

int main() {
    cout << lcs("ABCBDAB", "BDCABA") << "\n"; // 4
    return 0;
}`,
          complexity: "O(n · m) thời gian và bộ nhớ"
        }
      ],
      keyPoints: [
        "DP = bài con gối nhau + cấu trúc con tối ưu; đệ quy thuần lặp lại bài con nên bùng nổ.",
        "Bắt đầu bằng một câu định nghĩa dp[i] nghĩa là gì, rồi tới công thức chuyển và cơ sở.",
        "Memoization (top-down) = đệ quy + mảng nhớ; bảng (bottom-up) = vòng lặp theo thứ tự bài con.",
        "Đổi tiền: dp[x] = min(dp[x − c] + 1), dp[0] = 0, còn lại INF.",
        "LCS: khớp thì chéo + 1, không khớp thì max(trên, trái); độ phức tạp O(n·m)."
      ],
      pitfalls: [
        "Khởi tạo dp bằng 0 cho bài 'nhỏ nhất' làm kết quả sai; phải là INF cho trạng thái chưa đạt được.",
        "Cộng 1 vào INF gây tràn; kiểm tra dp[x − c] != INF trước.",
        "Quên cơ sở dp[0] hoặc lệch chỉ số (xâu 0-based, bảng 1-based) trong LCS.",
        "Dùng tham lam cho bài đổi tiền mà không chứng minh được tính đúng."
      ]
    },
    {
      id: "ch7-l9",
      title: "Chiến thuật làm bài thi",
      minutes: 12,
      sections: [
        {
          heading: "Phân bổ thời gian",
          body: "Gợi ý cho bài thi có 3–5 bài trong 90–120 phút:\n\n- **5–10 phút đầu:** đọc lướt toàn bộ đề, đánh dấu độ khó, xếp thứ tự làm từ dễ đến khó.\n- Làm bài dễ trước, hoàn thành chắc chắn (kể cả test biên) trước khi sang bài sau.\n- Mỗi bài: đọc kỹ → ước lượng độ phức tạp từ giới hạn → nghĩ thuật toán trên giấy → mới viết code.\n- Dành **10–15 phút cuối** để kiểm tra lại, không bắt đầu thuật toán mới.\n- Bị kẹt hơn 15–20 phút ở một bài: chuyển sang bài khác rồi quay lại.",
        },
        {
          heading: "Chấm theo test: lấy điểm từng phần",
          body: "Đề chấm theo bộ test thường có các nhóm với giới hạn n tăng dần. Do đó:\n\n- Luôn viết trước **lời giải vét cạn đúng** (chậm cũng được) — nó cho điểm các test nhỏ và dùng để đối chiếu.\n- Sau đó mới cải tiến theo gợi ý của giới hạn (hai con trỏ, prefix sum, chặt nhị phân, DP).\n- Nộp bản chạy đúng trước, rồi mới nộp bản tối ưu; đừng đánh đổi điểm chắc chắn lấy bản chưa kiểm tra.\n- Đọc kỹ định dạng input/output: thừa dấu cách hay thiếu xuống dòng đôi khi vẫn chấp nhận, nhưng thừa chữ (ví dụ in 'Answer:') thì sai.",
        },
        {
          heading: "Debug nhanh",
          body: "Khi chương trình chạy sai:\n\n1. Chạy lại đúng **input mẫu của đề** — rất nhiều lỗi lộ ra ngay.\n2. Tự tạo test nhỏ nhất làm chương trình sai (n = 1, 2, 3).\n3. In giá trị trung gian (`cerr << ...` để không lẫn vào output chuẩn).\n4. So sánh với lời giải vét cạn trên nhiều test ngẫu nhiên nhỏ.\n5. Rà các nghi phạm quen thuộc: tràn `int`, lệch chỉ số một đơn vị, quên khởi tạo biến/mảng, quên reset giữa các test, truy cập ngoài mảng.\n6. Biên dịch với `-Wall -fsanitize=address,undefined` khi làm ở nhà để bắt lỗi bộ nhớ và tràn số có dấu.\n\nPhân biệt mã lỗi: **WA** (sai kết quả → logic/biên), **TLE** (quá chậm → đổi thuật toán, kiểm tra I/O), **RE** (lỗi chạy → ngoài mảng, chia 0, đệ quy sâu).",
        }
      ],
      keyPoints: [
        "Đọc cả đề trước, làm bài dễ trước, bị kẹt quá 15–20 phút thì chuyển bài.",
        "Viết lời giải vét cạn đúng trước để lấy điểm test nhỏ, rồi mới tối ưu.",
        "Debug: chạy input mẫu, tạo test nhỏ nhất gây sai, in bằng cerr, so với vét cạn.",
        "WA = sai logic/biên, TLE = thuật toán chậm, RE = lỗi chạy (ngoài mảng, chia 0, đệ quy sâu).",
        "Dành vài phút cuối để kiểm tra lại, không bắt đầu thuật toán mới."
      ],
      pitfalls: [
        "Sa đà vào một bài khó và không bao giờ đụng tới các bài dễ phía sau.",
        "Nộp bản tối ưu chưa test, làm mất điểm test nhỏ mà bản vét cạn đã chắc chắn lấy được.",
        "In thêm dòng debug lên stdout rồi quên xoá."
      ]
    }
  ],
  flashcards: [
    { front: "Giới hạn n ≤ 20 gợi ý độ phức tạp nào?", back: "O(2^n) hoặc O(2^n·n): quay lui, duyệt mọi tập con, bitmask." },
    { front: "Giới hạn n ≤ 10^5 hoặc 10^6 gợi ý độ phức tạp nào?", back: "O(n log n): sắp xếp, set/map, heap, chặt nhị phân. Còn lớn hơn nữa thì O(n)." },
    { front: "Một máy chấm làm được khoảng bao nhiêu phép tính đơn giản mỗi giây?", back: "Khoảng 10^8." },
    { front: "Vì sao long long c = a * b (a, b kiểu int) vẫn sai?", back: "Phép nhân tính bằng int nên tràn trước khi gán. Phải ép kiểu: (long long)a * b." },
    { front: "Hai dòng tăng tốc cin/cout?", back: "ios::sync_with_stdio(false); cin.tie(nullptr); (và dùng '\\n' thay endl). Không trộn với scanf/printf." },
    { front: "priority_queue<int> mặc định là gì? Làm sao có min-heap?", back: "Max-heap. Min-heap: priority_queue<int, vector<int>, greater<int>>." },
    { front: "Độ phức tạp của set/map và unordered_map?", back: "set/map: O(log n), có thứ tự. unordered_map: O(1) trung bình, O(n) xấu nhất, không có thứ tự." },
    { front: "lower_bound khác upper_bound thế nào?", back: "lower_bound: phần tử đầu tiên >= x. upper_bound: phần tử đầu tiên > x. Số lần x xuất hiện = upper − lower." },
    { front: "Comparator của sort cần thoả điều kiện gì?", back: "Trả true nếu a phải đứng trước b; là thứ tự ngặt (dùng < hoặc >, không dùng <=, >=)." },
    { front: "Đụng độ (collision) trong bảng băm là gì? Cách xử lý?", back: "Hai khoá khác nhau cho cùng chỉ số. Xử lý bằng nối chuỗi (danh sách mỗi ô) hoặc địa chỉ mở (dò ô khác)." },
    { front: "Two-sum bằng bảng băm làm thế nào?", back: "Duyệt j; tra S − a[j] trong bảng các phần tử đã thấy, rồi mới thêm a[j]. O(n)." },
    { front: "Hai con trỏ hai đầu tìm cặp tổng S: điều kiện và cách di chuyển?", back: "Mảng đã sắp xếp. s < S → l++; s > S → r--; s == S → xong. O(n)." },
    { front: "Cửa sổ trượt co giãn cho đoạn ngắn nhất có tổng >= S cần điều kiện gì?", back: "Các phần tử dương (tổng đơn điệu). Mở r, trong khi tổng >= S thì cập nhật đáp án và tăng l." },
    { front: "Công thức tổng đoạn bằng prefix sum?", back: "sum(l..r) = P[r] − P[l−1], với P[0] = 0." },
    { front: "Mảng hiệu dùng để làm gì và cập nhật ra sao?", back: "Cộng v vào đoạn [l, r] trong O(1): D[l] += v, D[r+1] −= v; khôi phục bằng prefix sum của D." },
    { front: "Đếm đoạn con có tổng K (có số âm) làm thế nào?", back: "Prefix sum + bảng băm đếm: với mỗi j cộng số lần đã thấy P[j] − K. O(n)." },
    { front: "Mẫu chặt nhị phân khoảng nửa mở tìm vị trí true đầu tiên?", back: "lo=0, hi=n; while(lo<hi){mid=lo+(hi−lo)/2; if(ok(mid)) hi=mid; else lo=mid+1;} kết quả lo." },
    { front: "Dấu hiệu dùng chặt nhị phân theo đáp án?", back: "Đề hỏi giá trị lớn nhất/nhỏ nhất thoả điều kiện, và nếu x khả thi thì các giá trị dễ hơn cũng khả thi (đơn điệu)." },
    { front: "Khác nhau giữa memoization và quy hoạch động bảng?", back: "Memoization: đệ quy top-down + mảng nhớ. Bảng: vòng lặp bottom-up từ bài con nhỏ đến lớn." },
    { front: "5 bước giải một bài DP?", back: "Định nghĩa trạng thái; công thức chuyển; trường hợp cơ sở; thứ tự tính; vị trí đáp án." },
    { front: "Công thức LCS?", back: "A[i]==B[j]: dp[i][j]=dp[i−1][j−1]+1; ngược lại max(dp[i−1][j], dp[i][j−1]). O(n·m)." },
    { front: "Gặp bài không ra thuật toán tối ưu trong lúc thi thì làm gì?", back: "Viết lời giải vét cạn đúng để lấy điểm test nhỏ, sau đó quay lại tối ưu hoặc chuyển sang bài khác." }
  ],
  quiz: [
    {
      id: "ch7-q1",
      question: "Đề cho n ≤ 10^5, thời gian 1 giây. Độ phức tạp nào phù hợp?",
      options: ["O(n²)", "O(n log n)", "O(2^n)", "O(n!)"],
      answer: 1,
      explanation: "O(n log n) ≈ 1,7·10^6 phép tính, rất nhanh. O(n²) = 10^10 vượt xa 10^8; O(2^n) và O(n!) vô cùng lớn."
    },
    {
      id: "ch7-q2",
      question: "Đề cho n ≤ 20 và yêu cầu chọn một tập con thoả điều kiện. Hướng làm phù hợp nhất là gì?",
      options: ["Duyệt mọi tập con hoặc quay lui, O(2^n)", "Chặt nhị phân O(log n)", "Chỉ cần duyệt một lần O(n)", "Sàng nguyên tố"],
      answer: 0,
      explanation: "2^20 ≈ 10^6 nên duyệt mọi tập con là khả thi. Các lựa chọn còn lại không liên quan đến việc chọn tập con hoặc không đủ tổng quát."
    },
    {
      id: "ch7-q3",
      question: "Đoạn code sau cho kết quả thế nào?",
      code: "int a = 100000, b = 100000;\nlong long c = a * b;\ncout << c;",
      options: ["10000000000", "0", "Không đảm bảo bằng 10^10 vì a * b tính bằng int và tràn trước khi gán", "Lỗi biên dịch"],
      answer: 2,
      explanation: "a * b là phép nhân hai int, kết quả 10^10 vượt giới hạn int nên tràn trước khi gán cho long long. Phải viết (long long)a * b."
    },
    {
      id: "ch7-q4",
      question: "Tác dụng của ios::sync_with_stdio(false) là gì?",
      options: [
        "Tăng độ chính xác của số thực",
        "Tự động đóng file khi kết thúc",
        "Cho phép đọc được số long long",
        "Tắt đồng bộ giữa iostream và stdio nên cin/cout nhanh hơn (nhưng không được trộn với scanf/printf)"
      ],
      answer: 3,
      explanation: "Nó chỉ ảnh hưởng tốc độ và việc đồng bộ với stdio; không liên quan đến độ chính xác, file hay kiểu số."
    },
    {
      id: "ch7-q5",
      question: "priority_queue<int> pq; pq.push(3); pq.push(9); pq.push(5); pq.top() trả về gì?",
      options: ["3", "9", "5", "Không xác định"],
      answer: 1,
      explanation: "priority_queue mặc định là max-heap nên top là phần tử lớn nhất (9). Muốn lấy 3 cần min-heap với greater<int>."
    },
    {
      id: "ch7-q6",
      question: "Độ phức tạp của thao tác find trên std::map là?",
      options: ["O(log n)", "O(1) trung bình", "O(n)", "O(n log n)"],
      answer: 0,
      explanation: "map là cây tìm kiếm cân bằng nên find là O(log n). O(1) trung bình là của unordered_map."
    },
    {
      id: "ch7-q7",
      question: "Với vector v đã sắp xếp tăng, lower_bound(v.begin(), v.end(), x) trả về iterator tới phần tử nào?",
      options: ["Phần tử đầu tiên lớn hơn x", "Phần tử cuối cùng nhỏ hơn hoặc bằng x", "Phần tử đầu tiên lớn hơn hoặc bằng x", "Một phần tử bất kỳ bằng x"],
      answer: 2,
      explanation: "lower_bound cho vị trí đầu tiên >= x. Phần tử đầu tiên > x là upper_bound; hai hàm không trả về vị trí tuỳ ý."
    },
    {
      id: "ch7-q8",
      question: "Comparator nào hợp lệ để sắp xếp giảm dần theo second của pair<int,int>?",
      options: [
        "return a.second <= b.second;",
        "return a.first >= b.first;",
        "return a.second >= b.second;",
        "return a.second > b.second;"
      ],
      answer: 3,
      explanation: "Comparator phải là thứ tự ngặt: dùng > hoặc <. Các dạng <=, >= trả true khi hai phần tử bằng nhau, vi phạm yêu cầu và có thể làm sort crash; hai đáp án đầu còn sai tiêu chí (tăng dần hoặc theo first)."
    },
    {
      id: "ch7-q9",
      question: "Đụng độ (collision) trong bảng băm là gì?",
      options: ["Bảng băm bị đầy hoàn toàn", "Hai khoá khác nhau có cùng giá trị băm (cùng ô)", "Một khoá bị xoá hai lần", "Hàm băm trả về số âm"],
      answer: 1,
      explanation: "Đụng độ là hai khoá khác nhau ánh xạ vào cùng chỉ số. Việc đầy bảng hay giá trị âm là vấn đề khác; xoá hai lần không phải đụng độ."
    },
    {
      id: "ch7-q10",
      question: "Dùng bảng băm đếm tần suất cho n phần tử có độ phức tạp trung bình là?",
      options: ["O(n)", "O(n²)", "O(n log² n)", "O(log n)"],
      answer: 0,
      explanation: "Mỗi phần tử cập nhật cnt[x]++ trong O(1) trung bình nên tổng O(n). O(n²) là cách đếm bằng hai vòng lặp."
    },
    {
      id: "ch7-q11",
      question: "Để dùng hai con trỏ (đầu – cuối) tìm cặp có tổng S, mảng cần thoả điều kiện gì?",
      options: ["Chỉ gồm số dương", "Có độ dài chẵn", "Đã được sắp xếp", "Các phần tử đôi một khác nhau"],
      answer: 2,
      explanation: "Lập luận loại bỏ (s < S → bỏ a[l]) chỉ đúng khi mảng sắp xếp. Số dương, độ dài chẵn hay phần tử phân biệt không cần thiết."
    },
    {
      id: "ch7-q12",
      question: "Vì sao cửa sổ trượt co giãn cho 'đoạn ngắn nhất có tổng >= S' có thể sai khi mảng chứa số âm?",
      options: [
        "Vì số âm không thể đọc bằng cin",
        "Vì tổng luôn tràn int",
        "Vì không thể dùng hai con trỏ trên mảng có số âm khi n lớn",
        "Vì tổng không còn đơn điệu theo độ dài cửa sổ nên không biết nên thu hay mở"
      ],
      answer: 3,
      explanation: "Với số âm, thêm phần tử có thể làm tổng giảm và bỏ phần tử có thể làm tổng tăng, phá tính đơn điệu mà thuật toán dựa vào. Các lý do khác không đúng bản chất."
    },
    {
      id: "ch7-q13",
      question: "Với P[0] = 0 và P[i] = a[1] + ... + a[i], tổng đoạn a[l..r] bằng?",
      options: ["P[r] − P[l]", "P[r] − P[l − 1]", "P[r] + P[l − 1]", "P[r − l]"],
      answer: 1,
      explanation: "P[r] gồm cả phần a[1..l−1] cần loại bỏ, tức P[l−1]. P[r] − P[l] sẽ thiếu a[l]."
    },
    {
      id: "ch7-q14",
      question: "Dùng mảng hiệu D, để cộng v vào mọi phần tử từ l đến r ta làm gì?",
      options: ["D[l] += v; D[r + 1] -= v;", "D[l] += v; D[r] -= v;", "D[l] -= v; D[r + 1] += v;", "Cộng v vào mọi D[i] với l ≤ i ≤ r"],
      answer: 0,
      explanation: "Prefix sum của D sẽ cộng v từ l trở đi và huỷ ngay sau r nhờ -v ở r+1. D[r] -= v huỷ sớm một vị trí; đổi dấu làm đáp án sai; cộng cả đoạn là O(n)."
    },
    {
      id: "ch7-q15",
      question: "Chặt nhị phân theo đáp án áp dụng được khi nào?",
      options: [
        "Khi mảng đầu vào có đúng 10^5 phần tử",
        "Khi mọi số đều dương",
        "Khi hàm kiểm tra ok(x) có tính đơn điệu theo x",
        "Khi đáp án là số nguyên tố"
      ],
      answer: 2,
      explanation: "Chặt nhị phân cần dãy ok(x) dạng đúng…đúng sai…sai (hoặc ngược lại). Kích thước n, dấu của phần tử hay tính nguyên tố không phải điều kiện."
    },
    {
      id: "ch7-q16",
      question: "Khi vòng lặp sau kết thúc, lo là gì?",
      code: "int lo = 0, hi = n;\nwhile (lo < hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (a[mid] < x) lo = mid + 1;\n    else hi = mid;\n}",
      options: [
        "Chỉ số của phần tử cuối cùng nhỏ hơn x",
        "Chỉ số của x, hoặc −1 nếu không có",
        "Chỉ số phần tử đầu tiên lớn hơn x",
        "Chỉ số phần tử đầu tiên lớn hơn hoặc bằng x (n nếu không có)"
      ],
      answer: 3,
      explanation: "Điều kiện 'thoả' là a[mid] >= x; vòng lặp tìm vị trí đầu tiên thoả, chính là lower_bound. Kết quả có thể bằng n, không bao giờ trả −1, và không phải upper_bound."
    },
    {
      id: "ch7-q17",
      question: "Vì sao nên viết mid = lo + (hi − lo) / 2 thay cho (lo + hi) / 2?",
      options: ["Để chạy nhanh hơn", "Để tránh tràn số khi lo + hi vượt giới hạn kiểu int", "Để mid luôn làm tròn lên", "Để mảng không cần sắp xếp"],
      answer: 1,
      explanation: "lo + hi có thể vượt 2^31 − 1 khi lo, hi cỡ 10^9. Hai cách có cùng tốc độ và cùng cách làm tròn xuống; việc sắp xếp không liên quan."
    },
    {
      id: "ch7-q18",
      question: "Memoization giúp fib(n) từ O(2^n) xuống O(n) vì sao?",
      options: [
        "Mỗi bài con được tính đúng một lần và các lần sau chỉ tra bảng",
        "Vì hàm không còn gọi đệ quy",
        "Vì giá trị fib được tính bằng công thức đóng",
        "Vì dùng nhiều luồng"
      ],
      answer: 0,
      explanation: "Cây gọi đệ quy thuần lặp lại cùng fib(k) rất nhiều lần; lưu kết quả loại bỏ việc lặp. Memoization vẫn dùng đệ quy, không dùng công thức đóng hay đa luồng."
    },
    {
      id: "ch7-q19",
      question: "Đặc điểm nào cho thấy một bài có thể giải bằng quy hoạch động?",
      options: [
        "Dữ liệu vào là một chuỗi ký tự",
        "Đồ thị có đúng một thành phần liên thông",
        "Bài tối ưu/đếm có bài con cùng dạng và các bài con bị lặp lại",
        "Cần sắp xếp trước khi xử lý"
      ],
      answer: 2,
      explanation: "DP khai thác cấu trúc con tối ưu và các bài con gối nhau. Kiểu dữ liệu, tính liên thông hay việc phải sắp xếp không phải dấu hiệu của DP."
    },
    {
      id: "ch7-q20",
      question: "Độ phức tạp thời gian của DP bảng cho LCS hai xâu độ dài n và m là?",
      options: ["O(n + m)", "O(max(n, m))", "O(n log m)", "O(n · m)"],
      answer: 3,
      explanation: "Có (n+1)(m+1) ô, mỗi ô tính O(1) → O(n·m). Hai đáp án đầu quá nhỏ vì ta duyệt toàn bộ bảng."
    },
    {
      id: "ch7-q21",
      question: "Trong bài đổi tiền tìm số đồng ít nhất, vì sao khởi tạo dp[x] = INF (x > 0) thay vì 0?",
      options: [
        "Để tiết kiệm bộ nhớ",
        "Vì 0 sẽ bị min chọn nhầm, coi như tạo được x bằng 0 đồng; INF biểu thị 'chưa tạo được'",
        "Vì C++ không cho khởi tạo 0",
        "Để thuật toán chạy theo thứ tự ngược"
      ],
      answer: 1,
      explanation: "Với bài tìm nhỏ nhất, giá trị khởi tạo phải là phần tử 'xấu nhất' để min thay thế. Khởi tạo 0 cho kết quả sai; các lý do khác không có cơ sở."
    },
    {
      id: "ch7-q22",
      question: "Trong lúc thi, gặp bài không nghĩ ra thuật toán tối ưu sau khoảng 15 phút. Nên làm gì?",
      options: [
        "Viết lời giải vét cạn đúng để lấy điểm test nhỏ rồi quay lại sau",
        "Ngồi nghĩ tiếp đến khi ra",
        "Bỏ trống và không nộp bài nào cho bài đó",
        "Nộp đại một đáp án in ra 0"
      ],
      answer: 0,
      explanation: "Chấm theo test cho điểm từng phần, nên bản vét cạn đúng vẫn lấy được điểm test nhỏ và dùng để đối chiếu sau này. Các lựa chọn còn lại mất thời gian hoặc bỏ điểm."
    }
  ],
  exercises: [
    {
      id: "ch7-e1",
      title: "Tổng các số lớn",
      difficulty: "Dễ",
      statement: "Cho n số nguyên a_1..a_n. In ra tổng của chúng.\n\nGiới hạn: 1 ≤ n ≤ 10^5, |a_i| ≤ 10^9.\n\nInput mẫu:\n4\n1000000000 1000000000 1000000000 1000000000\n\nOutput mẫu:\n4000000000",
      hint: "Tổng có thể vượt giới hạn của int. Chọn kiểu dữ liệu phù hợp cho cả biến tổng.",
      solution: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    long long sum = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        sum += x;
    }
    cout << sum << "\n";
    return 0;
}`,
      complexity: "O(n)"
    },
    {
      id: "ch7-e2",
      title: "Phần tử xuất hiện nhiều nhất",
      difficulty: "Dễ",
      statement: "Cho n số nguyên. In ra giá trị xuất hiện nhiều nhất và số lần xuất hiện của nó. Nếu có nhiều giá trị cùng số lần nhiều nhất, in giá trị nhỏ nhất.\n\nGiới hạn: 1 ≤ n ≤ 10^5, |a_i| ≤ 10^9.\n\nInput mẫu:\n7\n3 1 3 2 1 3 1\n\nOutput mẫu:\n1 3",
      hint: "Đếm tần suất bằng map (duyệt theo thứ tự khoá tăng dần). Chỉ cập nhật đáp án khi số lần lớn hơn hẳn.",
      solution: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    map<long long, int> cnt;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        cnt[x]++;
    }
    long long bestVal = 0;
    int bestCnt = 0;
    for (auto &p : cnt) {
        if (p.second > bestCnt) {   // khoá tăng dần + so sánh ngặt => lấy giá trị nhỏ nhất khi hoà
            bestCnt = p.second;
            bestVal = p.first;
        }
    }
    cout << bestVal << " " << bestCnt << "\n";
    return 0;
}`,
      complexity: "O(n log n)"
    },
    {
      id: "ch7-e3",
      title: "Two-sum bằng bảng băm",
      difficulty: "Dễ",
      statement: "Cho mảng n số nguyên và số S. Tìm cặp chỉ số (i, j), 1 ≤ i < j ≤ n, sao cho a_i + a_j = S. Nếu có nhiều cặp, chọn cặp có j nhỏ nhất, rồi i nhỏ nhất. Nếu không có, in -1.\n\nGiới hạn: 2 ≤ n ≤ 10^5, |a_i|, |S| ≤ 10^9.\n\nInput mẫu:\n5 9\n8 3 5 4 6\n\nOutput mẫu:\n3 4",
      hint: "Duyệt j từ trái sang phải, tra S − a_j trong bảng các giá trị đã gặp (lưu chỉ số xuất hiện đầu tiên), rồi mới thêm a_j.",
      solution: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long S;
    cin >> n >> S;
    unordered_map<long long, int> first;   // giá trị -> chỉ số (1-based) xuất hiện đầu tiên
    first.reserve(2 * n);
    for (int j = 1; j <= n; j++) {
        long long x;
        cin >> x;
        auto it = first.find(S - x);
        if (it != first.end()) {
            cout << it->second << " " << j << "\n";
            return 0;
        }
        if (!first.count(x)) first[x] = j;
    }
    cout << -1 << "\n";
    return 0;
}`,
      complexity: "O(n) trung bình"
    },
    {
      id: "ch7-e4",
      title: "Đếm cặp có tổng S (hai con trỏ)",
      difficulty: "Vừa",
      statement: "Cho mảng n số nguyên (có thể trùng nhau) và số S. Đếm số cặp chỉ số (i, j), i < j, sao cho a_i + a_j = S.\n\nGiới hạn: 2 ≤ n ≤ 10^5, |a_i|, |S| ≤ 10^9.\n\nInput mẫu:\n5 6\n1 5 3 3 3\n\nOutput mẫu:\n4",
      hint: "Sắp xếp rồi dùng hai đầu. Khi tìm được tổng bằng S, hãy đếm cả nhóm giá trị trùng ở mỗi đầu thay vì chỉ nhích một bước. Nếu a[l] == a[r], mọi cặp trong đoạn [l, r] đều thoả.",
      solution: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long S;
    cin >> n >> S;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    sort(a.begin(), a.end());
    long long cnt = 0;
    int l = 0, r = n - 1;
    while (l < r) {
        long long s = a[l] + a[r];
        if (s < S) l++;
        else if (s > S) r--;
        else if (a[l] == a[r]) {
            long long m = r - l + 1;
            cnt += m * (m - 1) / 2;
            break;
        } else {
            int i = l, j = r;
            while (a[l] == a[i]) l++;
            while (a[r] == a[j]) r--;
            cnt += (long long)(l - i) * (j - r);
        }
    }
    cout << cnt << "\n";
    return 0;
}`,
      complexity: "O(n log n)"
    },
    {
      id: "ch7-e5",
      title: "Đoạn con liên tiếp ngắn nhất có tổng ≥ S",
      difficulty: "Vừa",
      statement: "Cho mảng n số nguyên dương và số S. Tìm độ dài nhỏ nhất của một đoạn con liên tiếp có tổng ≥ S. Nếu không có đoạn nào, in 0.\n\nGiới hạn: 1 ≤ n ≤ 10^5, 1 ≤ a_i ≤ 10^4, 1 ≤ S ≤ 10^9.\n\nInput mẫu:\n6 7\n2 3 1 2 4 3\n\nOutput mẫu:\n2",
      hint: "Cửa sổ co giãn [l, r]: thêm a[r] vào tổng, trong khi tổng ≥ S thì ghi nhận độ dài và bỏ a[l]. Mỗi con trỏ chỉ đi một chiều.",
      solution: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long S;
    cin >> n >> S;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    int best = INT_MAX, l = 0;
    long long sum = 0;
    for (int r = 0; r < n; r++) {
        sum += a[r];
        while (sum >= S) {
            best = min(best, r - l + 1);
            sum -= a[l++];
        }
    }
    cout << (best == INT_MAX ? 0 : best) << "\n";
    return 0;
}`,
      complexity: "O(n)"
    },
    {
      id: "ch7-e6",
      title: "Cộng đoạn bằng mảng hiệu",
      difficulty: "Vừa",
      statement: "Cho mảng a gồm n số nguyên và q thao tác. Mỗi thao tác gồm l, r, v: cộng v vào mọi phần tử từ vị trí l đến r (chỉ số tính từ 1). In ra mảng sau khi thực hiện tất cả thao tác, các số cách nhau một dấu cách.\n\nGiới hạn: 1 ≤ n, q ≤ 10^5, |a_i|, |v| ≤ 10^9.\n\nInput mẫu:\n5 2\n1 2 3 4 5\n1 3 2\n2 5 -1\n\nOutput mẫu:\n3 3 4 3 4",
      hint: "Không cập nhật từng phần tử. Dùng mảng hiệu D: D[l] += v, D[r+1] -= v. Cuối cùng lấy prefix sum của D rồi cộng vào a. Dùng long long.",
      solution: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> a(n + 2), D(n + 2, 0);
    for (int i = 1; i <= n; i++) cin >> a[i];
    while (q--) {
        int l, r;
        long long v;
        cin >> l >> r >> v;
        D[l] += v;
        D[r + 1] -= v;
    }
    long long run = 0;
    for (int i = 1; i <= n; i++) {
        run += D[i];
        cout << a[i] + run << (i == n ? '\n' : ' ');
    }
    return 0;
}`,
      complexity: "O(n + q)"
    },
    {
      id: "ch7-e7",
      title: "Cắt cây lấy gỗ (chặt nhị phân theo đáp án)",
      difficulty: "Vừa",
      statement: "Có n cây với chiều cao h_1..h_n. Chọn độ cao lưỡi cưa H (nguyên, H ≥ 0): mỗi cây cao hơn H bị cắt phần phía trên H, thu được h_i − H mét gỗ. Cần thu được ít nhất M mét gỗ. Tìm H lớn nhất thoả điều kiện. Dữ liệu đảm bảo tổng chiều cao ≥ M.\n\nGiới hạn: 1 ≤ n ≤ 10^6, 1 ≤ M ≤ 2·10^9, 1 ≤ h_i ≤ 10^9.\n\nInput mẫu:\n4 7\n20 15 10 17\n\nOutput mẫu:\n15",
      hint: "Gỗ thu được giảm khi H tăng nên có tính đơn điệu. Chặt nhị phân H trong [0, max h]; hàm kiểm tra tính tổng max(0, h_i − H) bằng long long.",
      solution: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long M;
    cin >> n >> M;
    vector<long long> h(n);
    long long mx = 0;
    for (auto &x : h) {
        cin >> x;
        mx = max(mx, x);
    }
    auto ok = [&](long long H) {
        long long wood = 0;
        for (long long x : h)
            if (x > H) wood += x - H;
        return wood >= M;
    };
    long long lo = 0, hi = mx;   // ok(0) luôn đúng
    while (lo < hi) {
        long long mid = lo + (hi - lo + 1) / 2;
        if (ok(mid)) lo = mid;
        else hi = mid - 1;
    }
    cout << lo << "\n";
    return 0;
}`,
      complexity: "O(n log(max h))"
    },
    {
      id: "ch7-e8",
      title: "Đổi tiền: số đồng ít nhất",
      difficulty: "Vừa",
      statement: "Có n loại đồng xu với mệnh giá c_1..c_n, mỗi loại dùng không giới hạn số lần. Tìm số đồng xu ít nhất để tạo đúng số tiền S. Nếu không thể, in -1.\n\nGiới hạn: 1 ≤ n ≤ 100, 1 ≤ c_i ≤ 10^4, 1 ≤ S ≤ 10^4.\n\nInput mẫu:\n3 11\n1 2 5\n\nOutput mẫu:\n3",
      hint: "dp[x] là số đồng ít nhất tạo đúng x. dp[0] = 0, các ô khác INF. Xét x tăng dần, thử từng mệnh giá c ≤ x với dp[x − c] hợp lệ.",
      solution: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, S;
    cin >> n >> S;
    vector<int> c(n);
    for (auto &x : c) cin >> x;
    const int INF = 1e9;
    vector<int> dp(S + 1, INF);
    dp[0] = 0;
    for (int x = 1; x <= S; x++)
        for (int v : c)
            if (x >= v && dp[x - v] != INF)
                dp[x] = min(dp[x], dp[x - v] + 1);
    cout << (dp[S] == INF ? -1 : dp[S]) << "\n";
    return 0;
}`,
      complexity: "O(n · S)"
    },
    {
      id: "ch7-e9",
      title: "Đếm đoạn con có tổng bằng K",
      difficulty: "Khó",
      statement: "Cho mảng n số nguyên (có thể âm) và số K. Đếm số đoạn con liên tiếp (không rỗng) có tổng bằng K.\n\nGiới hạn: 1 ≤ n ≤ 2·10^5, |a_i| ≤ 10^9, |K| ≤ 10^14.\n\nInput mẫu:\n5 3\n1 2 1 -1 2\n\nOutput mẫu:\n3",
      hint: "Cửa sổ trượt không dùng được vì có số âm. Gọi P là prefix sum: đoạn kết thúc tại j có tổng K khi tồn tại i < j với P[i] = P[j] − K. Dùng bảng đếm các prefix đã gặp, đừng quên prefix rỗng 0. Kết quả cần long long.",
      solution: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long K;
    cin >> n >> K;
    map<long long, long long> seen;
    seen[0] = 1;   // prefix rỗng
    long long pref = 0, res = 0;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        pref += x;
        auto it = seen.find(pref - K);
        if (it != seen.end()) res += it->second;
        seen[pref]++;
    }
    cout << res << "\n";
    return 0;
}`,
      complexity: "O(n log n) với map (O(n) trung bình với unordered_map)"
    },
    {
      id: "ch7-e10",
      title: "Dãy con chung dài nhất (LCS)",
      difficulty: "Khó",
      statement: "Cho hai xâu A và B gồm chữ cái in hoa. Tìm độ dài dãy con chung dài nhất của chúng (dãy con không nhất thiết liên tiếp nhưng giữ đúng thứ tự).\n\nGiới hạn: 1 ≤ |A|, |B| ≤ 1000.\n\nInput mẫu:\nABCBDAB\nBDCABA\n\nOutput mẫu:\n4",
      hint: "dp[i][j] là LCS của i ký tự đầu của A và j ký tự đầu của B. Nếu hai ký tự cuối bằng nhau thì lấy dp[i−1][j−1] + 1, ngược lại lấy max của ô trên và ô bên trái.",
      solution: String.raw`#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string A, B;
    cin >> A >> B;
    int n = A.size(), m = B.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            if (A[i - 1] == B[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
            else dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
        }
    cout << dp[n][m] << "\n";
    return 0;
}`,
      complexity: "O(|A| · |B|)"
    }
  ]
});
