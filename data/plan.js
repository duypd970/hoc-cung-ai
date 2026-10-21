window.DSA_PLAN = {
  goal: "Tối đa hóa xác suất đạt điểm A/A+ trong bài thi cuối kỳ Cấu trúc dữ liệu & Giải thuật PTIT trong 2 tháng (45 phút/ngày).",
  principles: [
    "45 phút/ngày, tập trung giải quyết đúng 1 nhiệm vụ duy nhất.",
    "Ưu tiên theo chu trình: Hiểu bản chất → Tự viết code → Kiểm tra kết quả → Phân tích & sửa lỗi.",
    "Tuyệt đối không học thụ động bằng cách xem video hàng giờ hoặc đọc code giải sẵn.",
    "Mỗi ngày học phải tạo ra một bằng chứng tiến bộ cụ thể (code chạy được, ghi chú lỗi, điểm test).",
    "Mục tiêu tuần đầu: Định vị chính xác lỗ hổng và tự code các bài cơ bản từ màn hình trắng không nhìn tài liệu."
  ],
  goldenRule: "Không được tính một chủ đề là 'đã học' cho đến khi bạn tự code được và giải được bài mà không cần nhìn bất kỳ gợi ý hay lời giải nào.",
  days: [
    {
      day: 1,
      title: "Chẩn đoán năng lực thật",
      task: "Làm một mini-test gồm 5 bài trong 45 phút, hoàn toàn không xem tài liệu:\n1. Array: tìm phần tử lớn nhất và nhỏ nhất.\n2. String: kiểm tra chuỗi đối xứng (palindrome).\n3. Stack: kiểm tra ngoặc hợp lệ ()[]{}.\n4. Linked List: đảo ngược danh sách liên kết đơn.\n5. Sorting: viết một thuật toán sắp xếp cơ bản (Bubble/Selection/Insertion Sort).\n\nPhân bổ khoảng 8 phút/bài, 5 phút cuối để ghi lại lỗi và phân loại mức độ.",
      steps: [
        "Bài 1 (8 phút): Duyệt mảng tìm min và max trong một lượt duyệt O(n).",
        "Bài 2 (8 phút): Kiểm tra palindrome bằng kỹ thuật hai con trỏ từ hai đầu O(n).",
        "Bài 3 (8 phút): Dùng Stack kiểm tra ngoặc đóng/mở tương ứng và xử lý rỗng.",
        "Bài 4 (8 phút): Đảo chiều các liên kết trong Single Linked List bằng 3 con trỏ.",
        "Bài 5 (8 phút): Viết thuật toán sắp xếp cơ bản không nhìn tài liệu.",
        "Đánh giá (5 phút): Ghi nhận kết quả từng bài theo 3 mức màu: 🟢 Tự làm đúng, 🟡 Cần gợi ý, 🔴 Bế tắc hoặc sai."
      ],
      code: [
        "// Mini-test: 5 bài chẩn đoán nền tảng\n// 1. Min/Max Array\n// 2. IsPalindrome(s)\n// 3. IsValidParentheses(s)\n// 4. ReverseLinkedList(head)\n// 5. BasicSort(a)"
      ],
      passCriteria: [
        "Hoàn thành mini-test trong đúng 45 phút mà không mở tài liệu hay tìm kiếm Google.",
        "Mỗi bài được gắn nhãn trung thực theo 3 mức 🟢/🟡/🔴.",
        "Lập được danh sách cụ thể các chủ đề bị hổng để tập trung vá trong 6 ngày tiếp theo."
      ],
      avoid: [
        "Không Google lời giải trước khi hết giờ làm bài.",
        "Không đọc lại lý thuyết ngay trước khi làm test.",
        "Không sa đà vào một bài quá 10 phút làm ảnh hưởng các bài khác.",
        "Không đánh giá bản thân bằng cảm giác chủ quan 'hình như mình hiểu'."
      ],
      selfCheck: [
        {
          q: "Mục tiêu quan trọng nhất của ngày test chẩn đoán là gì?",
          a: "Xác định trung thực bản đồ lỗ hổng kiến thức hiện tại (phần nào 🟢 làm vững, phần nào 🟡 cần gợi ý, phần nào 🔴 hổng hoàn toàn) để tập trung vá đúng chỗ trong các ngày tiếp theo, chứ không phải cố đạt 5/5 bằng mọi giá."
        },
        {
          q: "Khi kiểm tra chuỗi palindrome, cách tiếp cận tối ưu về thời gian và bộ nhớ là gì?",
          a: "Dùng kỹ thuật hai con trỏ: một trỏ từ đầu `left = 0`, một trỏ từ cuối `right = s.length() - 1`. So sánh `s[left]` và `s[right]`, nếu khác nhau trả về false, nếu bằng thì dịch vào trong (`left++`, `right--`). Dừng khi `left >= right`. Độ phức tạp thời gian O(n), bộ nhớ phụ O(1)."
        },
        {
          q: "Khi kiểm tra ngoặc hợp lệ bằng Stack, những trường hợp nào dẫn đến kết luận chuỗi không hợp lệ?",
          a: "Gồm 3 trường hợp: (1) Gặp ngoặc đóng nhưng Stack đang rỗng; (2) Gặp ngoặc đóng nhưng đỉnh Stack không phải ngoặc mở tương ứng; (3) Duyệt hết chuỗi nhưng Stack vẫn còn phần tử (dư ngoặc mở)."
        }
      ],
      chapterRefs: ["ch1", "ch3", "ch4"],
      exerciseRefs: ["ch1-e6", "ch1-e7", "ch4-e2", "ch4-e4", "ch3-e1"]
    },
    {
      day: 2,
      title: "Big-O + tư duy phân tích",
      task: "Lấy 5 đoạn code ngắn có cấu trúc vòng lặp và xác định chính xác Big-O của từng đoạn. Viết một câu giải thích toán học súc tích cho mỗi đáp án.",
      steps: [
        "Đoạn 1: Phân tích vòng lặp đơn duyệt i từ 0 đến n-1.",
        "Đoạn 2: Phân tích hai vòng lặp lồng nhau độc lập cùng chạy n lượt.",
        "Đoạn 3: Phân tích vòng lặp tăng theo cấp số nhân i *= 2 đến n.",
        "Đoạn 4: Phân tích hai vòng lặp lồng nhau dạng tam giác j chạy từ 0 đến i.",
        "Đoạn 5: Phân tích vòng lặp ngoài chạy n lượt, vòng lặp trong nhân đôi j *= 2.",
        "Viết câu giải thích ngắn gọn cho từng đoạn và kiểm tra lại quy tắc cộng/nhân Big-O."
      ],
      code: [
        "// Đoạn 1: O(n)\nfor (int i = 0; i < n; i++)\n    cout << i;\n\n// Đoạn 2: O(n^2)\nfor (int i = 0; i < n; i++)\n    for (int j = 0; j < n; j++)\n        cout << i << j;\n\n// Đoạn 3: O(log n)\nfor (int i = 1; i < n; i *= 2)\n    cout << i;"
      ],
      passCriteria: [
        "Phân biệt chắc chắn các bậc tiệm cận: O(1), O(log n), O(n), O(n log n), O(n^2).",
        "Giải thích được nguyên nhân toán học (đếm số lần thân vòng lặp thực thi), không chỉ ghi nhớ đáp án.",
        "Trả lời đúng ít nhất 4/5 trường hợp (nếu sai từ 2/5 trở lên thì ngày 2 chưa đạt)."
      ],
      avoid: [
        "Không học thuộc lòng bảng Big-O một cách máy móc.",
        "Không đi sâu vào phân tích phân bổ chi phí (amortized analysis) hôm nay.",
        "Không học các cấu trúc dữ liệu mới trong ngày hôm nay.",
        "Không dành 45 phút chỉ để xem video bài giảng lý thuyết thụ động."
      ],
      selfCheck: [
        {
          q: "Tại sao vòng lặp `for (int i = 1; i < n; i *= 2)` lại có độ phức tạp thời gian là O(log n)?",
          a: "Sau mỗi bước lặp thứ k (bắt đầu từ k = 0), giá trị của biến i là 2^k. Vòng lặp dừng khi 2^k >= n, tương đương k >= log2(n). Số lần thực thi thân vòng lặp xấp xỉ log2(n), trong ký hiệu tiệm cận ta bỏ cơ số và được O(log n)."
        },
        {
          q: "Một chương trình gồm 2 đoạn tuần tự: đoạn 1 tốn O(n), đoạn 2 tốn O(n^2). Độ phức tạp tổng là bao nhiêu và tại sao?",
          a: "Độ phức tạp tổng là O(n^2). Theo quy tắc cộng của ký hiệu Big-O: O(f(n)) + O(g(n)) = O(max(f(n), g(n))). Khi n tiến tới vô cùng, bậc tăng n^2 hoàn toàn lấn át n."
        },
        {
          q: "Đoạn code gồm hai vòng lặp: `for (int i = 0; i < n; i++) for (int j = 0; j < i; j++)` có độ phức tạp là gì?",
          a: "Độ phức tạp là O(n^2). Tổng số lượt thực thi là 0 + 1 + 2 + ... + (n - 1) = n(n - 1)/2 = n^2/2 - n/2. Bỏ qua hằng số 1/2 và số hạng bậc thấp -n/2, ta được O(n^2)."
        }
      ],
      chapterRefs: ["ch1"],
      exerciseRefs: ["ch1-e5"]
    },
    {
      day: 3,
      title: "Sorting: biến kiến thức thành code",
      task: "Tự viết từ đầu không nhìn mẫu 3 thuật toán sắp xếp cơ bản: Bubble Sort, Selection Sort, Insertion Sort. Dùng mảng [7, 2, 9, 1, 5, 3] mô phỏng từng bước trên giấy cho cả 3 thuật toán.",
      steps: [
        "Viết Bubble Sort: so sánh cặp kề nhau, đẩy phần tử lớn nhất về cuối sau mỗi lượt.",
        "Viết Selection Sort: tìm vị trí phần tử nhỏ nhất trong đoạn chưa sắp xếp rồi swap về đầu.",
        "Viết Insertion Sort: chèn phần tử hiện tại vào đúng vị trí trong đoạn đã sắp xếp phía trước.",
        "Chạy tay mảng mẫu [7, 2, 9, 1, 5, 3] trên giấy, ghi trạng thái mảng sau mỗi vòng ngoài.",
        "So sánh số lần so sánh và hoán đổi của 3 thuật toán ở trường hợp tốt nhất và xấu nhất."
      ],
      code: [
        "// 1. Bubble Sort\nfor (int i = 0; i < n - 1; i++) {\n    for (int j = 0; j < n - i - 1; j++) {\n        if (a[j] > a[j + 1]) swap(a[j], a[j + 1]);\n    }\n}\n\n// 2. Selection Sort\nfor (int i = 0; i < n - 1; i++) {\n    int minIdx = i;\n    for (int j = i + 1; j < n; j++) {\n        if (a[j] < a[minIdx]) minIdx = j;\n    }\n    swap(a[i], a[minIdx]);\n}\n\n// 3. Insertion Sort\nfor (int i = 1; i < n; i++) {\n    int key = a[i], j = i - 1;\n    while (j >= 0 && a[j] > key) {\n        a[j + 1] = a[j];\n        j--;\n    }\n    a[j + 1] = key;\n}"
      ],
      passCriteria: [
        "Cả 3 thuật toán compile được, chạy ra mảng sắp xếp chính xác.",
        "Giải thích rõ ràng vai trò của từng vòng lặp ngoài và trong của cả 3 thuật toán.",
        "Nắm chắc độ phức tạp thời gian Best/Worst case của từng thuật toán.",
        "Trả lời được không nhìn tài liệu: 'Tại sao Insertion Sort có thể nhanh hơn Bubble Sort trên mảng gần như đã sắp xếp?'"
      ],
      avoid: [
        "Không học Quick Sort hay Merge Sort trong hôm nay.",
        "Không copy code từ trên mạng.",
        "Không tối ưu hóa vi mô hoặc sa đà vào việc viết code quá ngắn.",
        "Không học nhận diện hình thức mà phải hiểu cơ chế não tự sinh ra thuật toán."
      ],
      selfCheck: [
        {
          q: "Tại sao Insertion Sort có thể nhanh hơn Bubble Sort trên mảng gần như đã được sắp xếp?",
          a: "Với mảng gần như đã sắp xếp, vòng lặp while dịch chuyển của Insertion Sort dừng lại rất sớm (sau 1 phép so sánh với O(1)). Độ phức tạp tốt nhất của Insertion Sort là O(n) với rất ít phép gán. Trong khi đó, Bubble Sort (kể cả có cờ hiệu đã tối ưu) vẫn cần duyệt các cặp kề nhau và phép hoán đổi swap (3 phép gán) tốn kém hơn phép dịch mảng của Insertion Sort."
        },
        {
          q: "Thế nào là thuật toán sắp xếp ổn định (Stable Sort), và trong 3 thuật toán trên thuật toán nào không ổn định?",
          a: "Sắp xếp ổn định là thuật toán bảo toàn thứ tự tương đối ban đầu giữa các phần tử có giá trị khóa bằng nhau. Bubble Sort và Insertion Sort là ổn định (nếu chỉ đổi chỗ khi thỏa mãn strictly greater `>`). Selection Sort không ổn định vì thao tác hoán đổi phần tử nhỏ nhất với phần tử ở đầu mảng có thể nhảy qua các phần tử bằng nhau khác (ví dụ: mảng [2a, 2b, 1] khi đổi 2a với 1 sẽ thành [1, 2b, 2a], làm đảo trật tự giữa 2a và 2b)."
        },
        {
          q: "Điểm khác biệt cốt lõi giữa Selection Sort và Insertion Sort là gì?",
          a: "Selection Sort quét đoạn chưa sắp xếp để tìm phần tử nhỏ nhất rồi đưa vào cuối đoạn đã sắp xếp (luôn tốn O(n^2) phép so sánh bất kể dữ liệu ban đầu). Insertion Sort lấy phần tử tiếp theo của đoạn chưa sắp xếp rồi tìm vị trí thích hợp để chèn vào đoạn đã sắp xếp (có thể dừng sớm ngay khi tìm thấy vị trí, đạt O(n) trong trường hợp tốt nhất)."
        }
      ],
      chapterRefs: ["ch3"],
      exerciseRefs: ["ch3-e1", "ch3-e2", "ch3-e3"]
    },
    {
      day: 4,
      title: "Stack + Queue: tư duy LIFO và FIFO",
      task: "Tự cài đặt Stack và Queue bằng mảng hoặc vector (không dùng thư viện std::stack/std::queue), sau đó giải bài toán kinh điển: Kiểm tra một chuỗi ngoặc ()[]{} có hợp lệ hay không.",
      steps: [
        "Cài đặt MyStack bằng vector hoặc mảng: hàm push, pop, top, empty.",
        "Cài đặt MyQueue bằng mảng vòng hoặc hai con trỏ front/rear: enqueue, dequeue, empty.",
        "Viết giải thuật kiểm tra chuỗi ngoặc hợp lệ: gặp mở thì push, gặp đóng thì pop và so khớp cặp.",
        "Kiểm tra với các bộ test: `{[()]}`, `{[(])}`, `((()))`, `]` và chuỗi rỗng.",
        "Phân tích cơ chế LIFO của Stack và giải thích tại sao Stack là lựa chọn duy nhất đúng cho bài ngoặc."
      ],
      code: [
        "// Cài đặt Stack đơn giản bằng vector\nstruct MyStack {\n    vector<char> st;\n    void push(char x) { st.push_back(x); }\n    void pop() { if (!st.empty()) st.pop_back(); }\n    char top() { return st.back(); }\n    bool empty() { return st.empty(); }\n};\n\n// Giải thuật kiểm tra ngoặc hợp lệ\nbool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '[' || c == '{') st.push(c);\n        else {\n            if (st.empty()) return false;\n            char top = st.top(); st.pop();\n            if (c == ')' && top != '(') return false;\n            if (c == ']' && top != '[') return false;\n            if (c == '}' && top != '{') return false;\n        }\n    }\n    return st.empty();\n}"
      ],
      passCriteria: [
        "Tự code được Stack và giải thích rõ bản chất LIFO (Last In First Out).",
        "Tự code được Queue và giải thích rõ bản chất FIFO (First In First Out).",
        "Tự viết hoàn chỉnh thuật toán bracket matching mà không cần tra cứu mẫu.",
        "Trả lời chuẩn xác câu hỏi logic: 'Tại sao bài ngoặc cần Stack chứ không phải Queue?'"
      ],
      avoid: [
        "Không học priority queue hay heap nâng cao trong hôm nay.",
        "Không học deque hay các container phức tạp.",
        "Không phụ thuộc máy móc vào template STL mà không hiểu cách tự cài đặt cơ bản."
      ],
      selfCheck: [
        {
          q: "Tại sao bài kiểm tra ngoặc hợp lệ bắt buộc phải dùng Stack chứ không phải Queue?",
          a: "Bởi vì các cặp ngoặc có tính chất lồng nhau (nested structure): dấu ngoặc mở nào xuất hiện sau cùng thì phải được đóng lại đầu tiên (Last Open, First Closed). Cấu trúc LIFO của Stack khớp chính xác với tính chất này: khi gặp ngoặc đóng, ta lấy ngay ngoặc mở gần nhất trên đỉnh Stack để so khớp. Nếu dùng Queue (FIFO), ta sẽ lấy ngoặc mở xuất hiện đầu tiên, vi phạm hoàn toàn quy tắc lồng nhau."
        },
        {
          q: "Hàng đợi vòng (Circular Queue) giải quyết vấn đề gì của hàng đợi cài bằng mảng thường?",
          a: "Trong mảng thông thường, sau các phép dequeue, con trỏ front dịch sang phải tạo ra khoảng trống không sử dụng được ở đầu mảng, dẫn đến hiện tượng 'tràn ảo' khi rear chạm cuối mảng dù đầu mảng còn trống. Hàng đợi vòng dùng phép toán chia lấy dư `(rear + 1) % capacity` để quấn ngược rear về đầu mảng, tận dụng tối đa dung lượng bộ nhớ."
        },
        {
          q: "Độ phức tạp thời gian và không gian của thuật toán kiểm tra ngoặc hợp lệ là bao nhiêu?",
          a: "Thời gian là O(n) do mỗi ký tự trong chuỗi có độ dài n được duyệt đúng 1 lần và các thao tác push/pop tốn O(1). Không gian phụ trợ là O(n) trong trường hợp xấu nhất khi chuỗi toàn ngoặc mở (ví dụ `((((((...`)."
        }
      ],
      chapterRefs: ["ch4"],
      exerciseRefs: ["ch4-e1", "ch4-e3", "ch4-e2"]
    },
    {
      day: 5,
      title: "Linked List: danh sách liên kết đơn",
      task: "Tự cài đặt Singly Linked List từ struct Node với các thao tác: insert đầu, insert cuối, delete node, search. Sau đó bắt buộc tự viết thuật toán đảo ngược danh sách liên kết (reverse) và vẽ sơ đồ con trỏ.",
      steps: [
        "Định nghĩa struct Node chứa giá trị int val và con trỏ Node* next.",
        "Cài đặt hàm chèn đầu (pushFront) và chèn cuối (pushBack).",
        "Cài đặt hàm tìm kiếm (search) và hàm xóa node theo giá trị (deleteNode).",
        "Viết hàm reverseList(Node* &head) đảo ngược danh sách liên kết bằng vòng lặp.",
        "Vẽ sơ đồ chạy tay với danh sách 1 -> 2 -> 3 -> 4 -> NULL và kiểm tra trường hợp danh sách rỗng hoặc 1 node."
      ],
      code: [
        "struct Node {\n    int val;\n    Node* next;\n    Node(int v) : val(v), next(nullptr) {}\n};\n\nNode* reverseList(Node* head) {\n    Node* prev = nullptr;\n    Node* cur = head;\n    while (cur != nullptr) {\n        Node* next = cur->next;\n        cur->next = prev;\n        prev = cur;\n        cur = next;\n    }\n    return prev;\n}"
      ],
      passCriteria: [
        "Vẽ được sơ đồ con trỏ ra giấy: head -> [1] -> [2] -> [3] -> NULL.",
        "Giải thích chính xác sự thay đổi của 3 biến con trỏ `prev`, `cur`, `next` trong từng bước đảo ngược.",
        "Code reverse chạy đúng, không lỗi truy cập con trỏ null trên các trường hợp biên: `[]`, `[1]`, `[1, 2]`, `[1, 2, 3, 4]`."
      ],
      avoid: [
        "Không học doubly linked list hay circular linked list trong ngày này.",
        "Không dùng iterator phức tạp.",
        "Không cố thuộc lòng mã nguồn mà phải hiểu đường đi của từng mũi tên liên kết."
      ],
      selfCheck: [
        {
          q: "Giải thích cơ chế hoạt động của 3 biến con trỏ `prev`, `cur`, `next` trong thuật toán đảo ngược Linked List?",
          a: "Khởi tạo `prev = nullptr`, `cur = head`. Ở mỗi bước lặp: (1) Lưu node kế tiếp `next = cur->next` để không làm mất phần còn lại của danh sách; (2) Đảo mũi tên liên kết `cur->next = prev`; (3) Tịnh tiến `prev = cur`; (4) Tịnh tiến `cur = next`. Vòng lặp dừng khi `cur == nullptr`, lúc đó `prev` trỏ vào node cuối cùng ban đầu, trở thành head mới của danh sách đảo ngược."
        },
        {
          q: "So sánh ưu và nhược điểm của Singly Linked List so với mảng động (std::vector)?",
          a: "Ưu điểm của DSLK: chèn và xóa ở đầu danh sách tốn O(1) mà không cần dịch chuyển phần tử; không bị chi phí tái cấp phát khi tăng kích thước. Nhược điểm: không truy cập ngẫu nhiên theo chỉ số O(1) (phải duyệt tuần tự O(n)); tốn thêm bộ nhớ cho biến con trỏ `next`; hiệu năng bộ nhớ đệm (cache locality) kém hơn mảng do các node nằm rải rác trên heap."
        },
        {
          q: "Tại sao khi xóa một node trong Singly Linked List ta thường cần giữ con trỏ trỏ tới node ngay trước nó?",
          a: "Vì DSLK đơn là liên kết một chiều, không thể truy cập lùi lại phía trước. Để ngắt bỏ node cần xóa, ta bắt buộc phải cập nhật con trỏ `next` của node đứng trước nó trỏ thẳng tới node đứng sau nó: `prev->next = cur->next`."
        }
      ],
      chapterRefs: ["ch4"],
      exerciseRefs: ["ch4-e4"]
    },
    {
      day: 6,
      title: "Binary Search + tư duy tìm kiếm",
      task: "Tự viết Binary Search từ số 0 không dùng hàm có sẵn. Chạy thử 3 trường hợp với mảng A = [1, 3, 5, 7, 9, 11, 15]: search(7), search(2), search(15). Tự trả lời và chứng minh tại sao Binary Search là O(log n).",
      steps: [
        "Viết hàm binarySearch(a, target): khởi tạo hai biên left = 0, right = n - 1.",
        "Thiết lập điều kiện dừng vòng lặp while (left <= right).",
        "Tính vị trí trung vị an toàn: mid = left + (right - left) / 2.",
        "Cập nhật biên: nếu a[mid] == target thì trả về mid; nếu a[mid] < target thì left = mid + 1; ngược lại right = mid - 1.",
        "Xử lý trường hợp không tìm thấy sau khi thoát vòng lặp trả về -1.",
        "Thử nghiệm với 3 ca test: tìm thấy ở giữa (7), không tìm thấy (2), tìm thấy ở cuối (15)."
      ],
      code: [
        "int binarySearch(const vector<int>& a, int target) {\n    int left = 0, right = (int)a.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (a[mid] == target) return mid;\n        if (a[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}"
      ],
      passCriteria: [
        "Tự code Binary Search từ màn hình trắng không nhìn template có sẵn.",
        "Xác định đúng điều kiện biên (left <= right), không bị lỗi lặp vô hạn.",
        "Xử lý chuẩn xác cả 3 ca test: tìm thấy, không tìm thấy, phần tử ở biên.",
        "Chứng minh được độ phức tạp thời gian O(log n) dựa trên việc không gian tìm kiếm giảm một nửa sau mỗi bước."
      ],
      avoid: [
        "Không học binary search tree (BST) trong hôm nay.",
        "Không vội học các biến thể chặt nhị phân kết quả khó.",
        "Không cố viết đệ quy chỉ vì nghĩ DSA phải đệ quy — hãy ưu tiên vòng lặp để nắm chắc bản chất biên.",
        "Không sao chép mã nguồn mà không tự tay chạy kiểm thử từng bước."
      ],
      selfCheck: [
        {
          q: "Tại sao Binary Search có độ phức tạp thời gian là O(log n)?",
          a: "Ban đầu mảng có n phần tử. Sau mỗi phép so sánh tại vị trí mid, nếu chưa tìm thấy, ta loại bỏ một nửa không gian tìm kiếm. Kích thước còn lại lần lượt là n/2, n/4, ..., n/(2^k). Thuật toán kết thúc khi không gian tìm kiếm còn 1 phần tử (n/(2^k) = 1), suy ra số bước tối đa k = log2(n). Do đó độ phức tạp là O(log n)."
        },
        {
          q: "Tại sao nên viết `mid = left + (right - left) / 2` thay vì `mid = (left + right) / 2`?",
          a: "Khi `left` và `right` là các số nguyên lớn gần giới hạn trên của kiểu dữ liệu (ví dụ gần INT_MAX), phép cộng `left + right` sẽ bị tràn số (integer overflow) tạo thành số âm, dẫn đến chỉ số mảng không hợp lệ và gây lỗi chương trình. Viết `left + (right - left) / 2` đảm bảo giá trị luôn nằm an toàn trong khoảng [left, right]."
        },
        {
          q: "Khi nào dùng điều kiện `while (left <= right)` và khi nào dùng `while (left < right)`?",
          a: "Dùng `left <= right` khi không gian tìm kiếm là đoạn đóng [left, right] và ta muốn kiểm tra giá trị tại mid ngay trong vòng lặp (khi left == right vẫn còn 1 phần tử cần kiểm tra). Dùng `left < right` khi tìm kiếm biên trái/phải (lower_bound/upper_bound) với mục tiêu thu hẹp dần khoảng chứa câu trả lời cho đến khi hai con trỏ gặp nhau tại duy nhất 1 điểm."
        }
      ],
      chapterRefs: ["ch3"],
      exerciseRefs: ["ch3-e4"]
    },
    {
      day: 7,
      title: "Bài kiểm tra tổng hợp 45 phút",
      task: "Làm một bài mock test nghiêm túc trong đúng 45 phút, hoàn toàn không mở tài liệu:\n- Phần A (10 phút): Xác định Big-O của hai vòng for lồng nhau.\n- Phần B (10 phút): Viết Stack và giải bài toán ngoặc hợp lệ.\n- Phần C (10 phút): Viết Linked List reverse.\n- Phần D (10 phút): Viết Binary Search.\n- Phần E (5 phút): Tự ghi 'Tôi yếu nhất ở: 1. ... 2. ... 3. ...'\n\nChấm điểm theo thang điểm 100 và xác định chiến lược cho tuần tiếp theo.",
      steps: [
        "Phần A (10 phút): Phân tích chi tiết độ phức tạp thuật toán và giải thích cơ chế.",
        "Phần B (10 phút): Tự viết cấu trúc Stack và giải thuật kiểm tra ngoặc hợp lệ.",
        "Phần C (10 phút): Tự định nghĩa Node và viết hàm đảo ngược danh sách liên kết đơn.",
        "Phần D (10 phút): Tự viết hàm Binary Search chuẩn mực không lỗi tràn số.",
        "Phần E (5 phút): Đánh giá khách quan và ghi chép 3 điểm yếu lớn nhất vào sổ tay.",
        "Tổng kết điểm số theo rubric và thang đánh giá."
      ],
      code: [],
      passCriteria: [
        "Hoàn thành toàn bộ mock test trong đúng 45 phút mà không tra cứu tài liệu.",
        "Đạt từ 75/100 điểm trở lên để đủ điều kiện bước sang Tuần 2.",
        "Nếu đạt dưới 75 điểm: cam kết dừng lại, học lại những phần bị sai và làm lại test sau 24 giờ.",
        "Ghi lại đủ ít nhất 3 lỗ hổng cụ thể vào mục tự đánh giá."
      ],
      avoid: [
        "Không tra cứu bất kỳ tài liệu nào trong suốt 45 phút làm bài.",
        "Không nới lỏng thời gian làm bài quá 45 phút.",
        "Không bỏ qua Phần E (tự ghi điểm yếu).",
        "Không tự dối mình nếu điểm dưới 75% mà vẫn tiếp tục sang tuần mới."
      ],
      selfCheck: [
        {
          q: "Nếu kết quả bài mock test đạt dưới 75%, bạn cần làm gì theo quy tắc 7 ngày?",
          a: "Tuyệt đối không vội vã chuyển sang các chủ đề mới của Tuần 2. Phải quay lại các câu bị sai hoặc bị trừ điểm, đọc lại phần lý thuyết liên quan, tự code lại không nhìn lời giải, và làm lại một bài mock test tương tự sau đúng 24 giờ cho đến khi vượt qua mốc 75%."
        },
        {
          q: "Vòng lặp giải quyết lỗ hổng sau khi kết thúc 7 ngày chẩn đoán là gì?",
          a: "Vòng lặp gồm 7 bước: Xác định đã biết gì / chưa biết gì → Định vị lỗ hổng cụ thể → Học kiến thức mục tiêu → Tự viết code → Tự kiểm tra → Ghi nhận lỗi vào sổ lỗi sai → Lặp lại hàng tuần."
        },
        {
          q: "Quy tắc duy nhất cho toàn bộ 2 tháng học tập để đạt A/A+ là gì?",
          a: "Không được tính một chủ đề là 'đã học' cho đến khi bạn tự code được từ đầu và tự giải được bài tập mà không cần nhìn bất kỳ gợi ý hay lời giải nào."
        }
      ],
      chapterRefs: ["ch1", "ch3", "ch4"],
      exerciseRefs: ["ch4-e2", "ch4-e4", "ch3-e4"]
    }
  ],
  mock: {
    minutes: 45,
    parts: [
      {
        id: "A",
        title: "Phân tích Big-O",
        minutes: 10,
        prompt: "Xác định độ phức tạp Big-O của đoạn mã sau:\n\nfor (int i = 0; i < n; i++) {\n    for (int j = 0; j < n; j++) {\n        cout << i;\n    }\n}\n\nViết lời giải thích chi tiết, nêu rõ số phép toán, trường hợp tốt nhất (Best-case) và xấu nhất (Worst-case).",
        maxScore: 15,
        rubric: [
          "Xác định đúng độ phức tạp thời gian O(n^2) (5 điểm)",
          "Giải thích rõ ràng cơ chế: vòng ngoài lặp n lần, mỗi lần vòng trong lặp n lần nên tổng số lần lặp là n * n = n^2 (5 điểm)",
          "Nêu đúng độ phức tạp không gian O(1) và nhận xét cả Best-case lẫn Worst-case đều là O(n^2) (5 điểm)"
        ]
      },
      {
        id: "B",
        exerciseRef: "ch4-e2",
        title: "Cài đặt Stack & Kiểm tra ngoặc hợp lệ",
        minutes: 10,
        prompt: "Tự viết cấu trúc MyStack cơ bản (hoặc dùng std::stack) và hiện thực hàm:\n\nbool isValid(string s)\n\nKiểm tra chuỗi chứa các dấu ngoặc '()[]{}' có hợp lệ hay không. Ví dụ: '{[()]}' -> true, '{[(])}' -> false.",
        maxScore: 25,
        rubric: [
          "Hiểu và áp dụng đúng cấu trúc LIFO của Stack (5 điểm)",
          "Duyệt qua từng ký tự của chuỗi, push chính xác khi gặp ngoặc mở '(', '[', '{' (5 điểm)",
          "Xử lý chuẩn khi gặp ngoặc đóng: kiểm tra stack rỗng, lấy top và so khớp đúng cặp tương ứng (10 điểm)",
          "Xử lý chính xác trường hợp biên: chuỗi rỗng và kiểm tra stack.empty() ở cuối hàm (5 điểm)"
        ]
      },
      {
        id: "C",
        exerciseRef: "ch4-e4",
        title: "Đảo ngược Danh sách liên kết đơn",
        minutes: 10,
        prompt: "Định nghĩa struct Node và hiện thực hàm:\n\nNode* reverseList(Node* head)\n\nĐảo ngược một danh sách liên kết đơn và trả về con trỏ head mới. Không dùng mảng phụ.",
        maxScore: 25,
        rubric: [
          "Khai báo chuẩn struct Node với trường giá trị và con trỏ next (5 điểm)",
          "Khởi tạo đúng các biến con trỏ cần thiết (prev = nullptr, cur = head) (5 điểm)",
          "Vòng lặp đảo chiều chính xác: lưu next, đổi cur->next = prev, tịnh tiến prev và cur (10 điểm)",
          "Xử lý an toàn các ca biên: danh sách rỗng (nullptr), danh sách 1 node và trả về đúng con trỏ prev (5 điểm)"
        ]
      },
      {
        id: "D",
        exerciseRef: "ch3-e4",
        title: "Tìm kiếm nhị phân (Binary Search)",
        minutes: 10,
        prompt: "Viết hàm tìm kiếm nhị phân hoàn chỉnh:\n\nint binarySearch(const vector<int>& a, int target)\n\nTìm target trong mảng a đã sắp xếp tăng dần. Trả về chỉ số của target nếu tìm thấy, ngược lại trả về -1.",
        maxScore: 25,
        rubric: [
          "Khởi tạo đúng biên left = 0, right = a.size() - 1 và điều kiện vòng lặp while (left <= right) (5 điểm)",
          "Tính trung vị mid an toàn tránh tràn số nguyên: left + (right - left) / 2 (5 điểm)",
          "So sánh a[mid] == target trả về mid; thu hẹp biên chính xác: left = mid + 1 hoặc right = mid - 1 (10 điểm)",
          "Xử lý đúng khi target không tồn tại trong mảng: trả về -1 sau khi thoát vòng lặp (5 điểm)"
        ]
      },
      {
        id: "E",
        title: "Tự chẩn đoán & Ghi nhận điểm yếu",
        minutes: 5,
        prompt: "Dựa trên quá trình làm 4 phần trên, tự đánh giá trung thực và ghi lại:\n'Tôi yếu nhất ở:\n1. ...\n2. ...\n3. ...'",
        maxScore: 10,
        rubric: [
          "Liệt kê đủ ít nhất 3 điểm yếu hoặc lỗ hổng cụ thể về mặt thuật toán, cú pháp hoặc xử lý biên (6 điểm)",
          "Đề xuất hành động khắc phục tương ứng cho các ngày tiếp theo (4 điểm)"
        ]
      }
    ],
    scale: [
      { min: 90, label: "🟢 Nền tảng rất tốt" },
      { min: 75, label: "🟡 Có thể tiếp tục" },
      { min: 60, label: "🟠 Cần củng cố" },
      { min: 0, label: "🔴 Không nên vội học topic mới" }
    ]
  },
  weeks: [
    {
      week: 1,
      title: "Tuần 1: Chẩn đoán năng lực & Xây nền giải bài",
      focus: "Thực hiện lộ trình 7 ngày chẩn đoán, phát hiện lỗ hổng và rèn phản xạ tự code từ màn hình trắng không phụ thuộc tài liệu.",
      topics: [
        "Mini-test 5 bài chẩn đoán nền tảng",
        "Big-O và phân tích vòng lặp tiệm cận",
        "Ba thuật toán sắp xếp cơ bản (Bubble, Selection, Insertion)",
        "Stack, Queue và bài toán ngoặc hợp lệ",
        "Singly Linked List và thuật toán đảo ngược",
        "Binary Search cơ bản và phân tích biên",
        "Mock test chẩn đoán 45 phút và bản đồ điểm yếu"
      ],
      chapterRefs: ["ch1", "ch3", "ch4"]
    },
    {
      week: 2,
      title: "Tuần 2: Mảng, Chuỗi, Big-O & Kỹ thuật mảng cơ bản",
      focus: "Thành thạo phân tích độ phức tạp, thao tác mảng, chuỗi, tiền tố và mảng đánh dấu.",
      topics: [
        "Kiểu dữ liệu, cấu trúc dữ liệu và ADT",
        "Phân tích Big-O chi tiết (O, Ω, Θ) và quy tắc cộng/nhân",
        "Mảng động, String và kỹ thuật Prefix Sum",
        "Kỹ thuật hai con trỏ (Two Pointers) cơ bản",
        "Bảng băm (Hash Table) và mảng đếm tần suất"
      ],
      chapterRefs: ["ch1", "ch7"]
    },
    {
      week: 3,
      title: "Tuần 3: Thuật toán Sắp xếp, Tìm kiếm & Cấu trúc Tuyến tính",
      focus: "Nắm vững sắp xếp nâng cao (Merge Sort, Quick Sort), tìm kiếm nhị phân và ứng dụng Stack/Queue.",
      topics: [
        "Merge Sort, Quick Sort và phân tích độ phức tạp đệ quy",
        "Binary Search nâng cao và các mẫu tìm kiếm biên (lower/upper bound)",
        "Stack: bài toán ngoặc, tiền tố/hậu tố, phần tử lớn hơn tiếp theo",
        "Queue, Deque và kỹ thuật cửa sổ trượt (Sliding Window)",
        "Danh sách liên kết đơn và đôi: thao tác nâng cao"
      ],
      chapterRefs: ["ch3", "ch4", "ch7"]
    },
    {
      week: 4,
      title: "Tuần 4: Đệ quy, Cây nhị phân, BST & Heap",
      focus: "Chinh phục tư duy đệ quy, cấu trúc phi tuyến cây nhị phân, cây tìm kiếm nhị phân và Heap/Priority Queue.",
      topics: [
        "Đệ quy và kỹ thuật chia để trị cơ bản",
        "Cây nhị phân: duyệt tiền thứ tự, trung thứ tự, hậu thứ tự",
        "Cây tìm kiếm nhị phân (BST): tìm kiếm, chèn, xóa node",
        "Cây cân bằng AVL (khái niệm cân bằng và phép quay)",
        "Heap và Priority Queue: cài đặt và ứng dụng"
      ],
      chapterRefs: ["ch2", "ch5"]
    },
    {
      week: 5,
      title: "Tuần 5: Đồ thị cơ bản & Thuật toán duyệt BFS/DFS",
      focus: "Biểu diễn đồ thị, thành thạo duyệt BFS/DFS và các ứng dụng liên thông, đường đi, chu trình.",
      topics: [
        "Biểu diễn đồ thị: ma trận kề và danh sách kề",
        "Duyệt theo chiều rộng (BFS) và đường đi ngắn nhất đồ thị không trọng số",
        "Duyệt theo chiều sâu (DFS) và thành phần liên thông",
        "Kiểm tra chu trình trên đồ thị có hướng và vô hướng",
        "Sắp xếp Tô pô (Topological Sort)"
      ],
      chapterRefs: ["ch6"]
    },
    {
      week: 6,
      title: "Tuần 6: Đồ thị nâng cao & Lược đồ thuật toán",
      focus: "Cây khung nhỏ nhất, đường đi ngắn nhất, quay lui vét cạn và nhánh cận trong đề thi PTIT.",
      topics: [
        "Cây khung nhỏ nhất: thuật toán Kruskal, Prim và cấu trúc DSU",
        "Đường đi ngắn nhất: thuật toán Dijkstra dùng priority_queue",
        "Quay lui (Backtracking): sinh nhị phân, tổ hợp, hoán vị, N-Queens",
        "Nhánh cận (Branch and Bound): bài toán người du lịch (TSP)"
      ],
      chapterRefs: ["ch2", "ch6"]
    },
    {
      week: 7,
      title: "Tuần 7: Quy hoạch động & Tham lam (DP & Greedy)",
      focus: "Xây dựng công thức truy hồi quy hoạch động kinh điển và nhận diện chiến lược tham lam chuẩn PTIT.",
      topics: [
        "Thuật toán tham lam (Greedy): đổi tiền, chọn công việc",
        "Quy hoạch động 1D: dãy con tăng dài nhất (LIS), bài toán leo thang",
        "Quy hoạch động 2D: bài toán cái túi (Knapsack 0/1), xâu con chung dài nhất (LCS)",
        "Quy hoạch động trên lưới và đếm số đường đi",
        "Kỹ thuật giải bài tổng hợp với STL"
      ],
      chapterRefs: ["ch2", "ch7"]
    },
    {
      week: 8,
      title: "Tuần 8: Luyện đề tổng hợp, Mock Test & Vá sổ lỗi sai",
      focus: "Thi thử áp lực thời gian thực, rà soát sổ lỗi sai, tối ưu hóa code và chuẩn bị tâm lý đạt A/A+.",
      topics: [
        "Mock test tổng hợp 60-90 phút chuẩn đề thi cuối kỳ PTIT",
        "Rà soát toàn bộ sổ lỗi sai (Mistakes Notebook)",
        "Chiến thuật phân bổ thời gian và nhận diện dạng bài",
        "Tối ưu hóa I/O C++ và kỹ thuật tránh TLE/MLE",
        "Tổng kết các bẫy thường gặp trong đề thi PTIT"
      ],
      chapterRefs: ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7"]
    }
  ]
};
