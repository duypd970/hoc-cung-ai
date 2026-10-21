window.DSA_CHAPTERS = window.DSA_CHAPTERS || [];
window.DSA_CHAPTERS.push({
  id: "ch4", number: 4, title: "Ngăn xếp, hàng đợi, danh sách liên kết",
  summary: "Danh sách liên kết đơn/kép, ngăn xếp (LIFO), hàng đợi (FIFO) và hàng đợi ưu tiên: định nghĩa, cài đặt, thao tác và ứng dụng hay ra thi.",
  examWeight: "Cao",
  lessons: [
    {
      id: "ch4-l1", title: "Danh sách liên kết đơn: khái niệm và biểu diễn", minutes: 12,
      sections: [
        {
          heading: "Vì sao cần danh sách liên kết?",
          body: `Mảng lưu các phần tử **liên tục** trong bộ nhớ nên truy cập \`a[i]\` rất nhanh (O(1)), nhưng:\n\n- Kích thước cố định: khai báo thừa thì phí bộ nhớ, thiếu thì không thêm được.\n- Chèn/xoá ở giữa phải dịch chuyển nhiều phần tử: O(n).\n- Cần một khối nhớ liên tục đủ lớn.\n\n**Danh sách liên kết đơn (DSLK đơn)** là tập các **node** nằm rời rạc trong bộ nhớ. Mỗi node gồm hai phần: **dữ liệu** (data) và **con trỏ next** trỏ tới node kế tiếp. Node cuối có \`next = NULL\`. Ta chỉ cần giữ con trỏ **head** trỏ tới node đầu tiên.`
        },
        {
          heading: "Khai báo trong C++",
          body: `Node là cấu trúc tự trỏ (self-referential): bên trong node có con trỏ tới chính kiểu node đó. Danh sách rỗng khi \`head == NULL\`.`,
          code: `struct Node {
    int data;
    Node *next;
    Node(int x) : data(x), next(NULL) {}   // hàm tạo cho gọn
};

Node *head = NULL;      // danh sách rỗng

// Duyệt danh sách
void print(Node *head) {
    for (Node *p = head; p != NULL; p = p->next)
        cout << p->data << " ";
    cout << endl;
}`,
          complexity: "Duyệt: O(n). Truy cập phần tử thứ i: O(i) (không truy cập ngẫu nhiên được)"
        },
        {
          heading: "So sánh mảng và DSLK đơn",
          body: `- **Truy cập phần tử thứ i**: mảng O(1), DSLK O(n).\n- **Chèn/xoá đầu**: mảng O(n), DSLK O(1).\n- **Chèn/xoá khi đã có con trỏ tới vị trí**: DSLK O(1) (với DSLK đơn cần con trỏ tới node đứng trước), mảng O(n).\n- **Bộ nhớ**: DSLK tốn thêm một con trỏ cho mỗi node nhưng không bao giờ thừa chỗ.`
        }
      ],
      keyPoints: [
        "Node = dữ liệu + con trỏ next; node cuối có next = NULL; danh sách rỗng khi head = NULL.",
        "Không truy cập ngẫu nhiên: muốn tới phần tử thứ i phải đi từ head, tốn O(i).",
        "Chèn/xoá đầu danh sách chỉ O(1), không phải dịch chuyển như mảng.",
        "Luôn duyệt bằng con trỏ phụ p, KHÔNG di chuyển head nếu còn cần dùng head."
      ],
      pitfalls: [
        "Quên kiểm tra p != NULL trước khi viết p->next hoặc p->data: lỗi Segmentation fault kinh điển.",
        "Di chuyển trực tiếp head khi duyệt làm mất cả danh sách (rò rỉ bộ nhớ)."
      ]
    },
    {
      id: "ch4-l2", title: "DSLK đơn: chèn, xoá, tìm kiếm", minutes: 18,
      sections: [
        {
          heading: "Chèn vào đầu và vào cuối",
          body: `**Chèn đầu** (O(1)): tạo node mới, cho \`next\` của nó trỏ vào head cũ, rồi dời head về node mới.\n\n**Chèn cuối** (O(n) nếu chỉ có head): duyệt tới node cuối rồi nối node mới vào. Trường hợp danh sách rỗng phải xử lý riêng vì lúc đó cần gán lại head. Nếu giữ thêm con trỏ \`tail\` thì chèn cuối cũng O(1).`,
          code: `void insertFirst(Node *&head, int x) {   // Node*& để sửa được head của hàm gọi
    Node *p = new Node(x);
    p->next = head;
    head = p;
}

void insertLast(Node *&head, int x) {
    Node *p = new Node(x);
    if (head == NULL) { head = p; return; }
    Node *q = head;
    while (q->next != NULL) q = q->next;
    q->next = p;
}`,
          complexity: "insertFirst O(1); insertLast O(n) (O(1) nếu có tail)"
        },
        {
          heading: "Chèn vào giữa (sau node p / vị trí k)",
          body: `Chèn node mới \`t\` **sau** node \`p\`: thứ tự hai lệnh rất quan trọng. Phải nối \`t\` vào phần còn lại **trước**, rồi mới nối \`p\` vào \`t\`. Làm ngược lại sẽ mất phần đuôi danh sách.\n\nChèn tại vị trí k (đếm từ 0): nếu k = 0 thì chèn đầu, ngược lại đi tới node thứ k-1 rồi chèn sau nó.`,
          code: `void insertAfter(Node *p, int x) {
    Node *t = new Node(x);
    t->next = p->next;   // bước 1: t trỏ vào phần đuôi
    p->next = t;         // bước 2: p trỏ vào t
}

void insertAt(Node *&head, int k, int x) {   // k tính từ 0
    if (k == 0) { insertFirst(head, x); return; }
    Node *p = head;
    for (int i = 0; i < k - 1 && p != NULL; i++) p = p->next;
    if (p == NULL) return;   // k vượt quá độ dài
    insertAfter(p, x);
}`
        },
        {
          heading: "Xoá node",
          body: `Có ba tình huống:\n\n- **Xoá đầu**: lưu head cũ, dời head sang \`head->next\`, giải phóng node cũ.\n- **Xoá cuối / xoá giữa**: cần con trỏ **prev** đứng ngay trước node cần xoá, cho \`prev->next = cur->next\` rồi giải phóng \`cur\`.\n- **Xoá node có giá trị x**: duyệt với cặp (prev, cur), gặp \`cur->data == x\` thì cắt.`,
          code: `void deleteFirst(Node *&head) {
    if (head == NULL) return;
    Node *t = head;
    head = head->next;
    delete t;
}

void deleteValue(Node *&head, int x) {   // xoá node đầu tiên có giá trị x
    Node *prev = NULL, *cur = head;
    while (cur != NULL && cur->data != x) { prev = cur; cur = cur->next; }
    if (cur == NULL) return;             // không tìm thấy
    if (prev == NULL) head = cur->next;  // xoá đầu
    else prev->next = cur->next;
    delete cur;
}`,
          complexity: "O(n) do phải tìm node"
        },
        {
          heading: "Tìm kiếm",
          body: `Duyệt tuần tự từ head, so sánh từng node. Không dùng được tìm kiếm nhị phân vì không truy cập ngẫu nhiên.`,
          code: `Node* search(Node *head, int x) {
    for (Node *p = head; p != NULL; p = p->next)
        if (p->data == x) return p;
    return NULL;
}`,
          complexity: "O(n)"
        }
      ],
      keyPoints: [
        "Chèn đầu O(1); chèn cuối O(n) nếu không có tail.",
        "Chèn sau p: t->next = p->next TRƯỚC, p->next = t SAU.",
        "Xoá node cần con trỏ prev; xoá đầu phải cập nhật head.",
        "Truyền head bằng Node*& (hoặc trả về head mới) khi hàm có thể thay đổi head."
      ],
      pitfalls: [
        "Truyền head theo giá trị (Node *head) rồi gán head = ... trong hàm: head ở hàm gọi không đổi.",
        "Đảo thứ tự hai lệnh khi chèn giữa làm mất phần đuôi danh sách.",
        "Quên delete node bị xoá (rò rỉ bộ nhớ) hoặc dùng cur sau khi đã delete."
      ]
    },
    {
      id: "ch4-l3", title: "Đảo ngược DSLK đơn (prev – cur – next)", minutes: 15,
      sections: [
        {
          heading: "Ý tưởng",
          body: `Đảo danh sách nghĩa là **đổi hướng mọi mũi tên next**. Ta dùng ba con trỏ:\n\n- \`prev\`: node đã được đảo (ban đầu NULL),\n- \`cur\`: node đang xử lý (ban đầu head),\n- \`next\`: lưu lại node kế tiếp của cur **trước khi** đổi hướng, kẻo mất phần còn lại.\n\nMỗi vòng lặp: (1) \`next = cur->next\`, (2) \`cur->next = prev\`, (3) \`prev = cur\`, (4) \`cur = next\`. Khi cur = NULL thì prev chính là head mới.`,
          code: `Node* reverseList(Node *head) {
    Node *prev = NULL, *cur = head;
    while (cur != NULL) {
        Node *next = cur->next;   // 1. cất phần còn lại
        cur->next = prev;         // 2. đổi hướng mũi tên
        prev = cur;               // 3. tiến prev
        cur = next;               // 4. tiến cur
    }
    return prev;                  // head mới
}`,
          complexity: "Thời gian O(n), bộ nhớ phụ O(1)"
        },
        {
          heading: "Vẽ từng bước với [1, 2, 3, 4]",
          body: `Ký hiệu \`x->y\` là x trỏ tới y, \`N\` là NULL.\n\n- Ban đầu: prev=N, cur=1. Danh sách: 1->2->3->4->N\n- Vòng 1: next=2; 1->N; prev=1; cur=2. Phần đã đảo: 1->N\n- Vòng 2: next=3; 2->1; prev=2; cur=3. Phần đã đảo: 2->1->N\n- Vòng 3: next=4; 3->2; prev=3; cur=4. Phần đã đảo: 3->2->1->N\n- Vòng 4: next=N; 4->3; prev=4; cur=N. Phần đã đảo: 4->3->2->1->N\n- cur = N nên dừng, trả về prev = 4. Kết quả: **4 3 2 1**.`
        },
        {
          heading: "Kiểm tra các trường hợp biên",
          body: `- **[]** (head = NULL): vòng lặp không chạy, trả về prev = NULL. Đúng, danh sách rỗng.\n- **[1]**: next=N; 1->N; prev=1; cur=N. Trả về 1. Đúng.\n- **[1,2]**: vòng 1: 1->N, prev=1, cur=2; vòng 2: next=N, 2->1, prev=2, cur=N. Kết quả **2 1**.\n- **[1,2,3,4]**: kết quả **4 3 2 1** (như trên).\n\nHàm không cần if riêng cho các trường hợp biên: đó là dấu hiệu của cách viết đúng.\n\n**Mở rộng** – bản đệ quy (hay hỏi trong đề lý thuyết): đảo phần còn lại \`head->next\` rồi nối head vào cuối.`,
          code: `Node* reverseRec(Node *head) {
    if (head == NULL || head->next == NULL) return head;
    Node *newHead = reverseRec(head->next);
    head->next->next = head;   // node sau trỏ ngược về head
    head->next = NULL;
    return newHead;
}`,
          complexity: "Bản đệ quy: thời gian O(n), bộ nhớ ngăn xếp gọi hàm O(n)"
        }
      ],
      keyPoints: [
        "Bốn lệnh theo đúng thứ tự: cất next, đổi cur->next = prev, tiến prev, tiến cur.",
        "Kết quả trả về là prev (không phải cur, vì lúc kết thúc cur = NULL).",
        "Chạy đúng cho [], [1], [1,2], [1,2,3,4] mà không cần xử lý riêng.",
        "Độ phức tạp O(n) thời gian, O(1) bộ nhớ phụ."
      ],
      pitfalls: [
        "Quên lưu next trước khi gán cur->next = prev: mất phần còn lại của danh sách.",
        "Trả về head cũ (lúc này đã là node cuối) thay vì prev.",
        "Đảo xong quên cập nhật head ở nơi gọi hàm (không gán head = reverseList(head))."
      ]
    },
    {
      id: "ch4-l4", title: "Danh sách liên kết kép", minutes: 12,
      sections: [
        {
          heading: "Định nghĩa và biểu diễn",
          body: `Mỗi node của **DSLK kép** có hai con trỏ: \`next\` trỏ tới node sau và \`prev\` trỏ tới node trước. Nhờ vậy ta duyệt được **cả hai chiều** và có thể xoá một node mà chỉ cần con trỏ tới chính nó (không cần tìm node đứng trước).\n\nThường giữ cả \`head\` và \`tail\` để thao tác ở hai đầu đều O(1).`,
          code: `struct DNode {
    int data;
    DNode *prev, *next;
    DNode(int x) : data(x), prev(NULL), next(NULL) {}
};
DNode *head = NULL, *tail = NULL;`
        },
        {
          heading: "Thao tác chính",
          body: `Mọi thao tác phải cập nhật **cả hai** hướng liên kết. Hai lỗi hay gặp là quên một trong bốn con trỏ, hoặc quên cập nhật head/tail ở trường hợp biên.`,
          code: `void pushFront(int x) {
    DNode *p = new DNode(x);
    p->next = head;
    if (head != NULL) head->prev = p; else tail = p;
    head = p;
}

void pushBack(int x) {
    DNode *p = new DNode(x);
    p->prev = tail;
    if (tail != NULL) tail->next = p; else head = p;
    tail = p;
}

void removeNode(DNode *p) {          // xoá node p bất kỳ, O(1)
    if (p->prev != NULL) p->prev->next = p->next; else head = p->next;
    if (p->next != NULL) p->next->prev = p->prev; else tail = p->prev;
    delete p;
}`,
          complexity: "Thêm/xoá ở hai đầu và xoá node cho trước: O(1)"
        },
        {
          heading: "Mở rộng: std::list và deque",
          body: `**Mở rộng.** \`std::list<T>\` trong STL chính là DSLK kép: \`push_back\`, \`push_front\`, \`pop_back\`, \`pop_front\`, \`insert(it, x)\`, \`erase(it)\` đều O(1) khi đã có iterator. \`std::deque\` cho phép thêm/xoá ở hai đầu và vẫn truy cập \`d[i]\` O(1) (dùng khi cần cả hai).`,
          code: `#include <list>
list<int> L = {1, 2, 3};
L.push_front(0);                 // 0 1 2 3
L.push_back(4);                  // 0 1 2 3 4
auto it = L.begin(); ++it;       // trỏ tới 1
L.insert(it, 99);                // 0 99 1 2 3 4
L.erase(it);                     // xoá phần tử 1 -> 0 99 2 3 4`
        }
      ],
      keyPoints: [
        "Mỗi node có prev và next; duyệt được hai chiều.",
        "Xoá node cho trước chỉ O(1) vì biết cả node trước và node sau.",
        "Chèn/xoá phải sửa tối đa 4 con trỏ và cập nhật head/tail ở trường hợp biên.",
        "Đổi lại tốn thêm một con trỏ mỗi node và code dễ sai hơn DSLK đơn."
      ],
      pitfalls: [
        "Quên gán p->prev hoặc nút phía sau->prev khi chèn: danh sách sai khi duyệt ngược.",
        "Quên cập nhật tail khi xoá node cuối, hoặc head khi xoá node đầu."
      ]
    },
    {
      id: "ch4-l5", title: "Ngăn xếp (Stack): LIFO và cài đặt", minutes: 15,
      sections: [
        {
          heading: "Định nghĩa",
          body: `**Ngăn xếp** là danh sách mà việc thêm và lấy phần tử chỉ thực hiện ở **một đầu** gọi là **đỉnh** (top). Nguyên tắc **LIFO** (Last In – First Out): vào sau ra trước, giống chồng đĩa.\n\nCác phép toán: \`push(x)\` thêm vào đỉnh; \`pop()\` lấy đỉnh ra; \`top()\` xem đỉnh; \`empty()\`; \`size()\`. Cả năm đều O(1).\n\n- **Stack underflow**: pop/top khi ngăn xếp rỗng.\n- **Stack overflow**: push khi ngăn xếp (cài bằng mảng) đã đầy.`
        },
        {
          heading: "Cài đặt bằng mảng",
          body: `Dùng mảng \`a[]\` và biến \`top\` là chỉ số phần tử đỉnh (-1 nếu rỗng). Push: \`a[++top] = x\`. Pop: \`top--\`.`,
          code: `const int MAXN = 1000;
struct Stack {
    int a[MAXN];
    int top = -1;
    bool empty() { return top == -1; }
    bool full()  { return top == MAXN - 1; }
    void push(int x) { if (!full()) a[++top] = x; }
    void pop()       { if (!empty()) top--; }
    int  peek()      { return a[top]; }      // gọi khi !empty()
};`,
          complexity: "Mọi thao tác O(1)"
        },
        {
          heading: "Cài đặt bằng DSLK đơn",
          body: `Đỉnh ngăn xếp chính là **head** của danh sách: push = chèn đầu, pop = xoá đầu (đều O(1)). Không bị đầy (chỉ hết bộ nhớ máy).`,
          code: `struct LStack {
    Node *topNode = NULL;
    bool empty() { return topNode == NULL; }
    void push(int x) { Node *p = new Node(x); p->next = topNode; topNode = p; }
    void pop() {
        if (empty()) return;
        Node *t = topNode; topNode = topNode->next; delete t;
    }
    int peek() { return topNode->data; }
};`
        },
        {
          heading: "Mở rộng: std::stack",
          body: `**Mở rộng.** Trong thi lập trình dùng luôn \`stack<T>\` của STL (\`#include <stack>\`). Lưu ý \`pop()\` **không trả về giá trị**: phải gọi \`top()\` trước rồi mới \`pop()\`.`,
          code: `stack<int> st;
st.push(1); st.push(2); st.push(3);
cout << st.top() << endl;   // 3
st.pop();                   // bỏ 3, không trả về gì
cout << st.size() << endl;  // 2
while (!st.empty()) { cout << st.top() << " "; st.pop(); }   // 2 1`
        }
      ],
      keyPoints: [
        "LIFO: phần tử vào sau cùng được lấy ra đầu tiên.",
        "push/pop/top/empty/size đều O(1).",
        "Cài bằng mảng (có thể đầy) hoặc DSLK đơn (đỉnh = head).",
        "Với stack STL: top() rồi mới pop(), pop() không trả về giá trị."
      ],
      pitfalls: [
        "Gọi top()/pop() khi stack rỗng: hành vi không xác định (crash). Luôn kiểm tra empty().",
        "Cài mảng: để top bắt đầu bằng 0 mà không thống nhất ý nghĩa (top là 'chỉ số đỉnh' hay 'số phần tử') dẫn tới lệch một đơn vị."
      ]
    },
    {
      id: "ch4-l6", title: "Ứng dụng ngăn xếp: kiểm tra ngoặc, biểu thức hậu tố, khử đệ quy", minutes: 22,
      sections: [
        {
          heading: "Kiểm tra dãy ngoặc () [] {}",
          body: `Bài toán: dãy ngoặc hợp lệ khi mỗi ngoặc đóng khớp với **ngoặc mở gần nhất chưa được đóng** và cùng loại.\n\n**Vì sao phải là Stack mà không phải Queue?** Ngoặc mở gần nhất chưa đóng là ngoặc mở **vào sau cùng** – đúng tính chất LIFO. Hàng đợi (FIFO) sẽ trả ra ngoặc mở **cũ nhất** nên sai. Ví dụ \`([)]\` : khi gặp \`)\` thì stack có đỉnh là \`[\` nên không khớp \`(\` -> sai. Còn \`{[()]}\` thì đóng đúng thứ tự ngược lại lúc mở -> đúng.\n\nThuật toán: duyệt từng ký tự; ngoặc mở thì push; ngoặc đóng thì kiểm tra stack không rỗng và đỉnh đúng loại rồi pop; cuối cùng stack phải **rỗng**.`,
          code: `bool balanced(const string &s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') st.push(c);
        else {
            if (st.empty()) return false;          // đóng thừa
            char t = st.top(); st.pop();
            if ((c == ')' && t != '(') || (c == ']' && t != '[') || (c == '}' && t != '{'))
                return false;                       // sai loại
        }
    }
    return st.empty();                              // còn ngoặc mở chưa đóng -> sai
}`,
          complexity: "O(n) thời gian, O(n) bộ nhớ"
        },
        {
          heading: "Ký pháp Ba Lan (tiền tố, hậu tố)",
          body: `Biểu thức quen thuộc là ký pháp **trung tố** (infix): \`a + b * c\`, cần ngoặc và độ ưu tiên. **Hậu tố** (postfix, ký pháp Ba Lan đảo): toán tử đứng sau hai toán hạng, không cần ngoặc. **Tiền tố** (prefix, ký pháp Ba Lan): toán tử đứng trước.\n\n- \`a + b * c\` -> hậu tố \`a b c * +\`, tiền tố \`+ a * b c\`\n- \`(a + b) * c\` -> hậu tố \`a b + c *\`\n\n**Tính giá trị biểu thức hậu tố** bằng một stack: gặp số thì push; gặp toán tử thì pop hai số (số pop **đầu tiên** là toán hạng **phải**), tính, push kết quả. Cuối cùng stack còn đúng một giá trị.\n\nVí dụ \`6 2 3 + -\`: push 6, 2, 3; gặp \`+\`: 2+3=5, stack [6,5]; gặp \`-\`: 6-5=1. Kết quả **1**.`,
          code: `int evalPostfix(const vector<string> &tok) {
    stack<int> st;
    for (const string &t : tok) {
        if (t == "+" || t == "-" || t == "*" || t == "/") {
            int b = st.top(); st.pop();     // toán hạng phải
            int a = st.top(); st.pop();     // toán hạng trái
            if (t == "+") st.push(a + b);
            else if (t == "-") st.push(a - b);
            else if (t == "*") st.push(a * b);
            else st.push(a / b);
        } else st.push(stoi(t));
    }
    return st.top();
}`
        },
        {
          heading: "Chuyển trung tố sang hậu tố (Shunting-yard)",
          body: `Dùng stack chứa toán tử và ngoặc mở:\n\n- Toán hạng: xuất ngay ra kết quả.\n- \`(\`: push.\n- \`)\`: pop và xuất cho tới khi gặp \`(\` (bỏ \`(\`).\n- Toán tử: trong khi đỉnh stack là toán tử có độ ưu tiên **lớn hơn hoặc bằng** (với phép kết hợp trái) thì pop xuất; sau đó push toán tử hiện tại.\n- Hết biểu thức: pop xuất toàn bộ stack.\n\nƯu tiên: \`^\` > \`*\` \`/\` > \`+\` \`-\`.`
        },
        {
          heading: "Khử đệ quy bằng stack",
          body: `Lời gọi đệ quy thực chất được máy lưu trong **ngăn xếp gọi hàm**. Muốn khử đệ quy, ta tự dùng stack để lưu các tham số/trạng thái cần xử lý sau. Ví dụ duyệt cây NLR không đệ quy, DFS không đệ quy, Tháp Hà Nội đều làm được bằng cách này.\n\nLý do khử đệ quy: tránh tràn ngăn xếp khi độ sâu lớn (ví dụ 10^6) và kiểm soát bộ nhớ.`,
          code: `// In dãy số theo kiểu "đệ quy xuống sâu rồi in ngược":
void printRev(Node *p) { if (p) { printRev(p->next); cout << p->data << " "; } }

// Bản khử đệ quy: dùng stack tự quản lý
void printRevIter(Node *head) {
    stack<Node*> st;
    for (Node *p = head; p != NULL; p = p->next) st.push(p);
    while (!st.empty()) { cout << st.top()->data << " "; st.pop(); }
}`
        }
      ],
      keyPoints: [
        "Kiểm tra ngoặc: gặp mở thì push, gặp đóng thì so với đỉnh; cuối cùng stack phải rỗng.",
        "Cần Stack (LIFO) vì phải khớp ngoặc mở GẦN NHẤT chưa đóng; Queue (FIFO) cho ra ngoặc cũ nhất nên sai.",
        "Hậu tố: không cần ngoặc; tính giá trị bằng stack, pop đầu tiên là toán hạng phải.",
        "Khử đệ quy = tự dùng stack thay cho ngăn xếp gọi hàm của hệ thống."
      ],
      pitfalls: [
        "Quên kiểm tra stack rỗng khi gặp ngoặc đóng (chuỗi \")(\" làm crash).",
        "Quên điều kiện cuối: stack chưa rỗng thì chuỗi \"((\" vẫn bị coi là đúng.",
        "Khi tính hậu tố với - và /, đảo thứ tự hai toán hạng cho kết quả sai (a - b khác b - a)."
      ]
    },
    {
      id: "ch4-l7", title: "Hàng đợi (Queue): FIFO, mảng vòng, DSLK", minutes: 18,
      sections: [
        {
          heading: "Định nghĩa",
          body: `**Hàng đợi** là danh sách mà phần tử được **thêm ở cuối** (rear/back) và **lấy ra ở đầu** (front). Nguyên tắc **FIFO** (First In – First Out): vào trước ra trước, như xếp hàng mua vé.\n\nPhép toán: \`push(x)\` (enqueue), \`pop()\` (dequeue), \`front()\`, \`empty()\`, \`size()\`; đều O(1).`
        },
        {
          heading: "Cài đặt bằng mảng vòng",
          body: `Nếu dùng mảng thường với \`front\` và \`rear\` chỉ tăng, các ô phía trước bị bỏ phí dù đã lấy ra. **Mảng vòng** (circular array) khắc phục bằng cách quay về đầu mảng khi tới cuối, dùng phép chia dư.\n\nCách gọn nhất: giữ \`head\` (chỉ số phần tử đầu) và \`cnt\` (số phần tử).\n\n- Thêm: \`a[(head + cnt) % N] = x; cnt++\`\n- Lấy ra: \`head = (head + 1) % N; cnt--\`\n- Rỗng khi \`cnt == 0\`, đầy khi \`cnt == N\`.\n\nDùng biến cnt giúp phân biệt rõ rỗng/đầy; nếu chỉ dùng hai chỉ số front, rear thì cả hai trạng thái đều có thể làm front == rear, phải bỏ trống một ô.`,
          code: `const int N = 5;
struct CQueue {
    int a[N];
    int head = 0, cnt = 0;
    bool empty() { return cnt == 0; }
    bool full()  { return cnt == N; }
    void push(int x) { if (!full()) { a[(head + cnt) % N] = x; cnt++; } }
    void pop()       { if (!empty()) { head = (head + 1) % N; cnt--; } }
    int  front()     { return a[head]; }
};`,
          complexity: "Mọi thao tác O(1)"
        },
        {
          heading: "Cài đặt bằng DSLK đơn",
          body: `Giữ cả \`head\` (front) và \`tail\` (rear). Push = chèn cuối qua tail (O(1)); pop = xoá đầu. Khi pop làm danh sách rỗng phải đặt \`tail = NULL\`.`,
          code: `struct LQueue {
    Node *head = NULL, *tail = NULL;
    bool empty() { return head == NULL; }
    void push(int x) {
        Node *p = new Node(x);
        if (tail == NULL) head = tail = p;
        else { tail->next = p; tail = p; }
    }
    void pop() {
        if (empty()) return;
        Node *t = head; head = head->next;
        if (head == NULL) tail = NULL;     // đừng quên!
        delete t;
    }
    int front() { return head->data; }
};`
        },
        {
          heading: "Mở rộng: std::queue và ứng dụng",
          body: `**Mở rộng.** \`queue<T>\` của STL có \`push\`, \`pop\`, \`front\`, \`back\`, \`empty\`, \`size\`. Giống stack, \`pop()\` không trả về giá trị.\n\nỨng dụng: duyệt cây theo mức, **BFS** trên đồ thị, hàng chờ in/ xử lý tác vụ theo thứ tự đến, bộ đệm (buffer), mô phỏng.`,
          code: `queue<int> q;
q.push(1); q.push(2); q.push(3);
cout << q.front() << " " << q.back() << endl;   // 1 3
q.pop();                                         // bỏ 1
cout << q.front() << endl;                       // 2`
        }
      ],
      keyPoints: [
        "FIFO: thêm ở rear, lấy ở front; mọi thao tác O(1).",
        "Mảng vòng: chỉ số tăng theo (i + 1) % N, tránh phí ô trống phía trước.",
        "Biến cnt giúp phân biệt rỗng (cnt = 0) và đầy (cnt = N).",
        "Cài bằng DSLK cần head và tail; khi pop hết phải gán tail = NULL."
      ],
      pitfalls: [
        "Dùng rear = rear + 1 không lấy dư: tràn mảng dù còn ô trống phía trước.",
        "Pop làm DSLK rỗng nhưng quên tail = NULL: lần push sau nối vào node đã bị xoá.",
        "Dùng queue cho bài cần LIFO (hoặc ngược lại) – chọn nhầm cấu trúc."
      ]
    },
    {
      id: "ch4-l8", title: "Hàng đợi ưu tiên (priority queue)", minutes: 12,
      sections: [
        {
          heading: "Khái niệm",
          body: `**Hàng đợi ưu tiên** là hàng đợi mà phần tử lấy ra không phải vào trước mà là phần tử có **độ ưu tiên cao nhất** (ví dụ giá trị lớn nhất hoặc nhỏ nhất). Nó **không** theo FIFO.\n\nCài đặt:\n\n- Mảng/DSLK không sắp xếp: push O(1), lấy phần tử ưu tiên O(n).\n- Mảng/DSLK sắp xếp: push O(n), lấy O(1).\n- **Heap** (chương 5): push và pop đều O(log n), top O(1) – là cách chuẩn.`
        },
        {
          heading: "Mở rộng: priority_queue trong C++",
          body: `**Mở rộng.** \`priority_queue<T>\` mặc định là **max-heap**: \`top()\` trả về phần tử **lớn nhất**. Muốn lấy nhỏ nhất, khai báo với \`greater\`. Với cặp (khoảng cách, đỉnh) trong Dijkstra thường dùng \`pair\` và min-heap.`,
          code: `priority_queue<int> mx;                                  // max-heap
mx.push(5); mx.push(1); mx.push(9);
cout << mx.top() << endl;                                // 9

priority_queue<int, vector<int>, greater<int>> mn;       // min-heap
mn.push(5); mn.push(1); mn.push(9);
cout << mn.top() << endl;                                // 1

priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
pq.push({10, 2}); pq.push({3, 7});
cout << pq.top().first << " " << pq.top().second << endl; // 3 7`,
          complexity: "push, pop: O(log n); top: O(1)"
        },
        {
          heading: "So sánh nhanh ba cấu trúc",
          body: `- **Stack**: lấy phần tử vào **sau cùng** (LIFO).\n- **Queue**: lấy phần tử vào **trước nhất** (FIFO).\n- **Priority queue**: lấy phần tử **ưu tiên cao nhất**, bất kể thứ tự vào.\n\nVí dụ push 3, 1, 2 rồi pop một lần: stack ra 2, queue ra 3, priority_queue (max-heap) ra 3, min-heap ra 1.`
        }
      ],
      keyPoints: [
        "Priority queue lấy phần tử ưu tiên cao nhất, không theo thứ tự vào.",
        "Cài chuẩn bằng heap: push/pop O(log n), top O(1).",
        "priority_queue<int> mặc định là max-heap; min-heap dùng greater<int>.",
        "Dùng nhiều trong Dijkstra, Prim, lập lịch tác vụ."
      ],
      pitfalls: [
        "Quên rằng priority_queue mặc định lấy phần tử LỚN nhất khi cần nhỏ nhất.",
        "Với pair, so sánh theo first trước rồi mới tới second."
      ]
    }
  ],
  flashcards: [
    { front: "Node của DSLK đơn gồm những phần nào?", back: "Phần dữ liệu (data) và con trỏ next tới node kế tiếp. Node cuối có next = NULL." },
    { front: "Chèn đầu và chèn cuối DSLK đơn (chỉ có head) có độ phức tạp?", back: "Chèn đầu O(1); chèn cuối O(n) vì phải duyệt tới node cuối (O(1) nếu có thêm con trỏ tail)." },
    { front: "Chèn node t vào sau node p: hai lệnh đúng thứ tự?", back: "t->next = p->next; rồi p->next = t; (làm ngược sẽ mất phần đuôi)." },
    { front: "Muốn xoá một node trong DSLK đơn cần gì?", back: "Con trỏ prev đứng ngay trước node đó: prev->next = cur->next; rồi delete cur. Xoá đầu thì cập nhật head." },
    { front: "Đảo DSLK đơn: bốn lệnh trong vòng lặp?", back: "next = cur->next; cur->next = prev; prev = cur; cur = next; Kết quả head mới = prev. O(n) thời gian, O(1) bộ nhớ phụ." },
    { front: "DSLK kép hơn DSLK đơn ở điểm nào?", back: "Có thêm con trỏ prev: duyệt hai chiều và xoá node cho trước trong O(1). Đổi lại tốn thêm bộ nhớ, code dễ sai hơn." },
    { front: "Stack là gì? Nguyên tắc?", back: "Danh sách chỉ thêm/lấy ở một đầu (đỉnh). LIFO: vào sau ra trước." },
    { front: "Stack overflow và underflow khác nhau thế nào?", back: "Overflow: push khi đã đầy (cài mảng). Underflow: pop/top khi rỗng." },
    { front: "Vì sao kiểm tra ngoặc dùng Stack mà không dùng Queue?", back: "Ngoặc đóng phải khớp với ngoặc mở GẦN NHẤT chưa đóng (vào sau cùng) – tính chất LIFO. Queue cho ra ngoặc mở cũ nhất nên sai." },
    { front: "Điều kiện cuối cùng của thuật toán kiểm tra ngoặc?", back: "Stack phải rỗng; nếu còn ngoặc mở chưa đóng thì chuỗi sai." },
    { front: "Ký pháp hậu tố của a + b * c và (a + b) * c?", back: "a b c * +   và   a b + c *  (hậu tố không cần ngoặc)." },
    { front: "Tính biểu thức hậu tố: cách làm?", back: "Duyệt từ trái: số thì push; toán tử thì pop 2 số (pop đầu là toán hạng phải), tính, push kết quả." },
    { front: "Khử đệ quy nghĩa là gì?", back: "Thay lời gọi đệ quy (dùng ngăn xếp hệ thống) bằng vòng lặp + stack do ta tự quản lý." },
    { front: "Queue là gì? Nguyên tắc?", back: "Thêm ở cuối (rear), lấy ở đầu (front). FIFO: vào trước ra trước." },
    { front: "Vì sao dùng mảng vòng cho Queue?", back: "Để tái sử dụng các ô phía trước đã lấy ra; chỉ số tăng theo (i+1) % N." },
    { front: "Mảng vòng: công thức thêm và lấy với head, cnt?", back: "Thêm: a[(head+cnt)%N] = x, cnt++. Lấy: head = (head+1)%N, cnt--. Rỗng: cnt=0; đầy: cnt=N." },
    { front: "priority_queue<int> trong C++ lấy ra phần tử nào? Muốn lấy nhỏ nhất?", back: "Mặc định phần tử lớn nhất (max-heap). Lấy nhỏ nhất: priority_queue<int, vector<int>, greater<int>>." }
  ],
  quiz: [
    {
      id: "ch4-q1",
      question: "Ngăn xếp ban đầu rỗng. Thực hiện: push(1), push(2), push(3), pop(), push(4), pop(), pop(). Phần tử ở đỉnh ngăn xếp lúc này là?",
      options: ["1", "2", "4", "3"], answer: 0,
      explanation: "Sau 3 push: [1,2,3]. pop lấy 3 -> [1,2]. push(4) -> [1,2,4]. pop lấy 4 -> [1,2]. pop lấy 2 -> [1]. Đỉnh là 1."
    },
    {
      id: "ch4-q2",
      question: "Hàng đợi ban đầu rỗng. Thực hiện: push(1), push(2), push(3), pop(), push(4), pop(). Phần tử ở đầu hàng (front) là?",
      options: ["2", "3", "4", "1"], answer: 1,
      explanation: "Sau 3 push: [1,2,3] (front = 1). pop bỏ 1 -> [2,3]. push(4) -> [2,3,4]. pop bỏ 2 -> [3,4]. Front = 3. Đáp án 1 và 2 là các phần tử đã bị lấy ra; 4 là phần tử cuối (back)."
    },
    {
      id: "ch4-q3",
      question: "Để kiểm tra một dãy ngoặc () [] {} có hợp lệ hay không, cấu trúc dữ liệu phù hợp nhất là?",
      options: ["Hàng đợi", "Mảng hai chiều", "Ngăn xếp", "Cây nhị phân"], answer: 2,
      explanation: "Ngoặc đóng phải khớp với ngoặc mở gần nhất chưa đóng, tức phần tử vào sau cùng: LIFO nên dùng ngăn xếp. Hàng đợi cho ra ngoặc mở cũ nhất nên sai."
    },
    {
      id: "ch4-q4",
      question: "Thêm một phần tử vào ĐẦU danh sách liên kết đơn (có con trỏ head) có độ phức tạp?",
      options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], answer: 3,
      explanation: "Chỉ cần tạo node, cho next trỏ vào head cũ rồi dời head: số bước không phụ thuộc n."
    },
    {
      id: "ch4-q5",
      question: "Thêm một phần tử vào CUỐI danh sách liên kết đơn chỉ có con trỏ head (không có tail) có độ phức tạp?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], answer: 2,
      explanation: "Phải duyệt từ head tới node cuối nên tốn O(n). Chỉ khi có thêm con trỏ tail mới đạt O(1)."
    },
    {
      id: "ch4-q6",
      question: "Danh sách 1->2->3->4->NULL sau khi đảo ngược bằng thuật toán prev/cur/next. Giá trị của head->next->data là?",
      options: ["2", "1", "4", "3"], answer: 3,
      explanation: "Sau khi đảo ta có 4->3->2->1->NULL. head là node 4, head->next là node 3. Đáp án 4 là head->data, 1 là node cuối, 2 là phần tử thứ ba."
    },
    {
      id: "ch4-q7",
      question: "Biểu thức trung tố a + b * c khi chuyển sang ký pháp hậu tố là?",
      options: ["a b + c *", "a b * c +", "a b c * +", "+ a * b c"], answer: 2,
      explanation: "Phép nhân ưu tiên cao hơn nên b * c tính trước: b c *. Sau đó cộng với a: a b c * +. Đáp án 1 ứng với (a + b) * c; đáp án 4 là ký pháp tiền tố."
    },
    {
      id: "ch4-q8",
      question: "Giá trị của biểu thức hậu tố  6 2 3 + -  là?",
      options: ["1", "-1", "7", "11"], answer: 0,
      explanation: "Push 6, 2, 3. Gặp +: pop 3 và 2, được 5, push -> [6,5]. Gặp -: pop 5 (toán hạng phải) rồi 6 (trái): 6 - 5 = 1. Nếu đảo thứ tự sẽ ra -1 (sai)."
    },
    {
      id: "ch4-q9",
      question: "Hàng đợi cài đặt bằng mảng vòng kích thước N. Sau khi thêm một phần tử vào cuối, chỉ số rear được cập nhật thế nào?",
      options: ["rear = (rear + 1) % N", "rear = rear + 1", "rear = rear % N + 1", "rear = N - rear"], answer: 0,
      explanation: "Phép chia dư đưa chỉ số quay về 0 khi chạm N. rear + 1 sẽ tràn mảng; rear % N + 1 cho chỉ số từ 1..N (có thể bằng N, ngoài mảng)."
    },
    {
      id: "ch4-q10",
      question: "Thực hiện pop() trên ngăn xếp đang rỗng gây ra tình trạng gì?",
      options: ["Memory leak", "Stack overflow", "Dangling pointer", "Stack underflow"], answer: 3,
      explanation: "Lấy phần tử khi rỗng gọi là underflow. Overflow là push khi mảng đã đầy."
    },
    {
      id: "ch4-q11",
      question: "priority_queue<int> pq; pq.push(3); pq.push(9); pq.push(5); Giá trị pq.top() là?",
      options: ["3", "5", "9", "Không xác định"], answer: 2,
      explanation: "priority_queue mặc định là max-heap, top luôn là phần tử lớn nhất = 9. Muốn lấy nhỏ nhất phải dùng greater<int>."
    },
    {
      id: "ch4-q12",
      question: "Ngăn xếp rỗng. Thực hiện push(A), push(B), push(C), rồi 2 lần pop, tiếp theo push(D), sau đó pop cho tới khi rỗng. Dãy các phần tử được pop ra theo thứ tự là?",
      options: ["C B D A", "C B A D", "A D B C", "D A C B"], answer: 0,
      explanation: "Stack [A,B,C]. Hai pop đầu: C, B (còn [A]). push D -> [A,D]. Pop tiếp: D rồi A. Dãy: C B D A."
    },
    {
      id: "ch4-q13",
      question: "Với p là node trong DSLK đơn và p->next != NULL, đoạn lệnh nào xoá ĐÚNG node đứng sau p?",
      options: ["delete p; p = p->next;", "p->next = p;", "delete p->next; p->next = p->next->next;", "Node *t = p->next; p->next = t->next; delete t;"], answer: 3,
      explanation: "Phải lưu node cần xoá vào t, nối p qua t rồi mới giải phóng t. Đáp án 3 sai vì dùng p->next->next sau khi đã delete p->next (truy cập vùng nhớ đã giải phóng). Đáp án 1 xoá chính p; đáp án 2 tạo vòng lặp."
    },
    {
      id: "ch4-q14",
      question: "Ưu điểm chính của danh sách liên kết kép so với danh sách liên kết đơn là?",
      options: ["Tốn ít bộ nhớ hơn", "Duyệt được hai chiều và xoá một node đã biết con trỏ trong O(1)", "Truy cập phần tử thứ i trong O(1)", "Luôn nhanh hơn mảng"], answer: 1,
      explanation: "Con trỏ prev cho phép đi ngược và xoá node mà không cần tìm node đứng trước. DSLK kép tốn nhiều bộ nhớ hơn, vẫn không truy cập ngẫu nhiên O(1) và không phải lúc nào cũng nhanh hơn mảng."
    },
    {
      id: "ch4-q15",
      question: "Khử đệ quy một chương trình thường được thực hiện bằng cách nào?",
      options: ["Dùng hàng đợi để thay thế lời gọi", "Dùng ngăn xếp do ta tự quản lý để lưu trạng thái", "Dùng mảng hai chiều", "Dùng hàng đợi ưu tiên"], answer: 1,
      explanation: "Đệ quy dùng ngăn xếp gọi hàm của hệ thống; ta mô phỏng nó bằng một stack tường minh lưu tham số/trạng thái cần xử lý sau."
    },
    {
      id: "ch4-q16",
      question: "Ứng dụng nào sau đây thường dùng hàng đợi (Queue)?",
      options: ["DFS không đệ quy", "Kiểm tra ngoặc cân bằng", "Duyệt cây theo mức / BFS", "Tính giá trị biểu thức hậu tố"], answer: 2,
      explanation: "BFS và duyệt theo mức xử lý các đỉnh theo thứ tự được phát hiện (FIFO). Ba ứng dụng còn lại đều dùng ngăn xếp."
    }
  ],
  exercises: [
    {
      id: "ch4-e1", title: "Cài đặt ngăn xếp bằng mảng", difficulty: "Dễ",
      statement: `Cài đặt ngăn xếp số nguyên bằng mảng. Đọc Q thao tác, mỗi thao tác là một trong ba dạng:\n\n- \`push x\`: thêm x vào ngăn xếp.\n- \`pop\`: lấy phần tử đỉnh ra (nếu rỗng thì bỏ qua).\n- \`top\`: in phần tử đỉnh, nếu rỗng in \`EMPTY\`.\n\n**Input**: dòng đầu là Q (1 ≤ Q ≤ 100000), tiếp theo Q dòng thao tác.\n\n**Output**: với mỗi thao tác \`top\` in ra một dòng.\n\n**Ví dụ**\n\nInput:\n7\npush 5\npush 8\ntop\npop\ntop\npop\ntop\n\nOutput:\n8\n5\nEMPTY`,
      hint: "Dùng mảng và biến top = -1 khi rỗng. push: a[++top] = x. pop: chỉ giảm top nếu top >= 0.",
      solution: `#include <iostream>
#include <string>
using namespace std;

const int MAXN = 100005;
int st[MAXN], topIdx = -1;

int main() {
    int q;
    cin >> q;
    while (q--) {
        string cmd;
        cin >> cmd;
        if (cmd == "push") {
            int x;
            cin >> x;
            st[++topIdx] = x;
        } else if (cmd == "pop") {
            if (topIdx >= 0) topIdx--;
        } else {
            if (topIdx >= 0) cout << st[topIdx] << endl;
            else cout << "EMPTY" << endl;
        }
    }
    return 0;
}`,
      complexity: "O(Q)"
    },
    {
      id: "ch4-e2", title: "Kiểm tra dãy ngoặc hợp lệ", difficulty: "Dễ",
      statement: `Cho T xâu chỉ gồm các ký tự \`(\`, \`)\`, \`[\`, \`]\`, \`{\`, \`}\`. Với mỗi xâu, in \`YES\` nếu dãy ngoặc hợp lệ (mỗi ngoặc đóng khớp đúng loại với ngoặc mở gần nhất chưa đóng và không còn ngoặc mở thừa), ngược lại in \`NO\`.\n\n**Input**: dòng đầu là T, mỗi dòng sau là một xâu (độ dài ≤ 10^5, không có khoảng trắng).\n\n**Output**: T dòng YES/NO.\n\n**Ví dụ**\n\nInput:\n4\n{[()]}\n([)]\n((\n)(\n\nOutput:\nYES\nNO\nNO\nNO`,
      hint: "Ngoặc mở thì push. Ngoặc đóng: nếu stack rỗng hoặc đỉnh không cùng loại thì sai. Cuối cùng stack phải rỗng.",
      solution: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool balanced(const string &s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char t = st.top();
            st.pop();
            if ((c == ')' && t != '(') || (c == ']' && t != '[') || (c == '}' && t != '{'))
                return false;
        }
    }
    return st.empty();
}

int main() {
    int t;
    cin >> t;
    while (t--) {
        string s;
        cin >> s;
        cout << (balanced(s) ? "YES" : "NO") << endl;
    }
    return 0;
}`,
      complexity: "O(tổng độ dài các xâu)"
    },
    {
      id: "ch4-e3", title: "Cài đặt hàng đợi bằng mảng vòng", difficulty: "Vừa",
      statement: `Cài đặt hàng đợi số nguyên **sức chứa tối đa N** bằng mảng vòng. Có Q thao tác:\n\n- \`push x\`: thêm x vào cuối; nếu hàng đợi đã đầy thì in \`FULL\` (và không thêm).\n- \`pop\`: lấy phần tử đầu ra (rỗng thì bỏ qua).\n- \`front\`: in phần tử đầu, rỗng thì in \`EMPTY\`.\n\n**Input**: dòng đầu gồm N và Q, sau đó Q dòng thao tác.\n\n**Output**: các dòng kết quả theo thứ tự thao tác.\n\n**Ví dụ**\n\nInput:\n3 8\npush 1\npush 2\npush 3\npush 4\nfront\npop\npush 4\nfront\n\nOutput:\nFULL\n1\n2`,
      hint: "Giữ head và cnt. Vị trí thêm là (head + cnt) % N. pop: head = (head + 1) % N, cnt--.",
      solution: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    int n, q;
    cin >> n >> q;
    vector<int> a(n);
    int head = 0, cnt = 0;
    while (q--) {
        string cmd;
        cin >> cmd;
        if (cmd == "push") {
            int x;
            cin >> x;
            if (cnt == n) {
                cout << "FULL" << endl;
            } else {
                a[(head + cnt) % n] = x;
                cnt++;
            }
        } else if (cmd == "pop") {
            if (cnt > 0) {
                head = (head + 1) % n;
                cnt--;
            }
        } else {
            if (cnt > 0) cout << a[head] << endl;
            else cout << "EMPTY" << endl;
        }
    }
    return 0;
}`,
      complexity: "O(Q)"
    },
    {
      id: "ch4-e4", title: "Đảo ngược danh sách liên kết đơn", difficulty: "Vừa",
      statement: `Cho n số nguyên. Hãy xây dựng danh sách liên kết đơn (thêm lần lượt vào cuối), **đảo ngược danh sách bằng cách đổi con trỏ** (không dùng mảng phụ) và in ra danh sách sau khi đảo. Nếu n = 0 in \`EMPTY\`.\n\n**Input**: dòng đầu là n (0 ≤ n ≤ 10^5), dòng sau gồm n số nguyên.\n\n**Output**: các phần tử sau khi đảo, cách nhau một khoảng trắng.\n\n**Ví dụ**\n\nInput:\n4\n1 2 3 4\n\nOutput:\n4 3 2 1`,
      hint: "Dùng ba con trỏ prev, cur, next. Nhớ lưu next trước khi sửa cur->next. Head mới là prev.",
      solution: `#include <iostream>
using namespace std;

struct Node {
    int data;
    Node *next;
    Node(int x) : data(x), next(NULL) {}
};

Node* reverseList(Node *head) {
    Node *prev = NULL, *cur = head;
    while (cur != NULL) {
        Node *nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}

int main() {
    int n;
    cin >> n;
    if (n == 0) {
        cout << "EMPTY" << endl;
        return 0;
    }
    Node *head = NULL, *tail = NULL;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        Node *p = new Node(x);
        if (head == NULL) head = tail = p;
        else { tail->next = p; tail = p; }
    }
    head = reverseList(head);
    for (Node *p = head; p != NULL; p = p->next) {
        cout << p->data << (p->next ? " " : "");
    }
    cout << endl;
    while (head != NULL) {
        Node *t = head;
        head = head->next;
        delete t;
    }
    return 0;
}`,
      complexity: "O(n)"
    },
    {
      id: "ch4-e5", title: "Phần tử lớn hơn đầu tiên bên phải", difficulty: "Vừa",
      statement: `Cho dãy số nguyên a[1..n]. Với mỗi a[i], tìm phần tử **đầu tiên bên phải** lớn hơn a[i] (giá trị, không phải chỉ số). Nếu không có in -1.\n\n**Input**: dòng đầu n (1 ≤ n ≤ 10^6), dòng sau n số nguyên.\n\n**Output**: n số, cách nhau khoảng trắng.\n\n**Ví dụ**\n\nInput:\n4\n4 5 2 25\n\nOutput:\n5 25 25 -1`,
      hint: "Dùng ngăn xếp lưu chỉ số các phần tử chưa tìm được đáp án (giá trị giảm dần trong stack). Gặp a[i] lớn hơn đỉnh thì gán đáp án cho đỉnh và pop.",
      solution: `#include <iostream>
#include <stack>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin >> n;
    vector<long long> a(n), res(n, -1);
    for (auto &x : a) cin >> x;
    stack<int> st;                       // chỉ số các phần tử chưa có đáp án
    for (int i = 0; i < n; i++) {
        while (!st.empty() && a[st.top()] < a[i]) {
            res[st.top()] = a[i];
            st.pop();
        }
        st.push(i);
    }
    for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\\n");
    return 0;
}`,
      complexity: "O(n) – mỗi phần tử push và pop tối đa một lần"
    },
    {
      id: "ch4-e6", title: "Chuyển biểu thức trung tố sang hậu tố", difficulty: "Khó",
      statement: `Cho T biểu thức trung tố gồm các toán hạng là chữ cái thường a..z, các toán tử \`+ - * / ^\` và ngoặc \`( )\`, không có khoảng trắng. Quy ước ưu tiên: \`^\` cao nhất (kết hợp **phải**), rồi \`* /\`, rồi \`+ -\` (kết hợp trái). Hãy in biểu thức hậu tố tương ứng.\n\n**Input**: dòng đầu là T, mỗi dòng sau là một biểu thức hợp lệ (độ dài ≤ 200).\n\n**Output**: T dòng, mỗi dòng là biểu thức hậu tố (không có khoảng trắng).\n\n**Ví dụ**\n\nInput:\n3\na+b*c\n(a+b)*c-d/e\na^b^c\n\nOutput:\nabc*+\nab+c*de/-\nabc^^`,
      hint: "Dùng stack toán tử. Gặp toán tử o: trong khi đỉnh là toán tử có ưu tiên lớn hơn, hoặc bằng và o kết hợp trái (khác ^) thì pop ra kết quả. Gặp ')' pop tới khi gặp '('.",
      solution: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

int prec(char c) {
    if (c == '^') return 3;
    if (c == '*' || c == '/') return 2;
    if (c == '+' || c == '-') return 1;
    return 0;                            // '(' hoặc ký tự khác
}

string toPostfix(const string &s) {
    string out;
    stack<char> st;
    for (char c : s) {
        if (c >= 'a' && c <= 'z') {
            out += c;
        } else if (c == '(') {
            st.push(c);
        } else if (c == ')') {
            while (!st.empty() && st.top() != '(') {
                out += st.top();
                st.pop();
            }
            if (!st.empty()) st.pop();   // bỏ '('
        } else {                         // toán tử
            while (!st.empty() && st.top() != '(' &&
                   (prec(st.top()) > prec(c) || (prec(st.top()) == prec(c) && c != '^'))) {
                out += st.top();
                st.pop();
            }
            st.push(c);
        }
    }
    while (!st.empty()) {
        out += st.top();
        st.pop();
    }
    return out;
}

int main() {
    int t;
    cin >> t;
    while (t--) {
        string s;
        cin >> s;
        cout << toPostfix(s) << endl;
    }
    return 0;
}`,
      complexity: "O(độ dài biểu thức)"
    }
  ]
});
window.DSA_CHAPTERS.push({
  id: "ch5", number: 5, title: "Cây nhị phân",
  summary: "Cây nhị phân, ba phép duyệt NLR/LNR/LRN và duyệt theo mức, cây nhị phân tìm kiếm (BST), cây cân bằng AVL với 4 phép xoay, và Heap.",
  examWeight: "Cao",
  lessons: [
    {
      id: "ch5-l1", title: "Khái niệm, thuật ngữ và tính chất cây nhị phân", minutes: 15,
      sections: [
        {
          heading: "Định nghĩa và thuật ngữ",
          body: `**Cây nhị phân** là cây mà mỗi node có **tối đa hai con**, phân biệt rõ **con trái** và **con phải**. Một cây rỗng cũng là cây nhị phân.\n\n- **Gốc (root)**: node không có cha. **Lá (leaf)**: node không có con.\n- **Bậc của node**: số con của nó (0, 1 hoặc 2).\n- **Mức (level) / độ sâu của node**: khoảng cách (số cạnh) từ gốc tới node; gốc ở mức 0.\n- **Chiều cao cây h**: độ sâu lớn nhất của một node. Quy ước trong tài liệu này: cây một node có h = 0, cây rỗng có h = -1. **Hãy xem đề thi dùng quy ước nào** (có tài liệu cho cây một node cao 1).\n- **Cây con trái / cây con phải**: cây gốc tại con trái / con phải.`
        },
        {
          heading: "Tính chất quan trọng (theo quy ước gốc mức 0)",
          body: `- Mức i có **tối đa 2^i** node.\n- Cây có chiều cao h có **tối đa 2^(h+1) - 1** node.\n- Cây có n node có chiều cao **tối thiểu ⌊log2 n⌋**, tối đa n - 1 (cây suy biến thành một đường).\n- Gọi n0 là số lá, n2 là số node bậc 2 thì **n0 = n2 + 1**. Ví dụ cây có 5 node bậc 2 thì có 6 lá.\n\nChứng minh n0 = n2 + 1: tổng số cạnh = n - 1 = n1 + 2·n2; mà n = n0 + n1 + n2 nên n0 + n1 + n2 - 1 = n1 + 2·n2, suy ra n0 = n2 + 1.`
        },
        {
          heading: "Các loại cây nhị phân đặc biệt",
          body: `- **Cây nhị phân đầy (full)**: mọi node có 0 hoặc 2 con.\n- **Cây nhị phân hoàn hảo (perfect)**: mọi node trong có đủ 2 con và mọi lá cùng mức; có đúng 2^(h+1) - 1 node.\n- **Cây nhị phân hoàn chỉnh (complete)**: mọi mức đầy đủ, trừ mức cuối có thể thiếu nhưng các node dồn **sát về bên trái**. Heap là cây hoàn chỉnh.\n- **Cây suy biến (skewed)**: mỗi node chỉ có một con, giống danh sách liên kết; chiều cao n - 1.\n- **Cây cân bằng**: chiều cao hai cây con của mỗi node không chênh nhau quá nhiều (AVL: tối đa 1).`
        }
      ],
      keyPoints: [
        "Mỗi node tối đa 2 con, phân biệt trái/phải.",
        "Mức i tối đa 2^i node; chiều cao h tối đa 2^(h+1) - 1 node (gốc mức 0).",
        "n0 = n2 + 1 (số lá = số node bậc 2 cộng 1).",
        "Cây hoàn chỉnh dồn trái là nền tảng của Heap; cây suy biến là trường hợp xấu nhất của BST."
      ],
      pitfalls: [
        "Nhầm quy ước chiều cao (tính bằng số cạnh hay số node): đọc kỹ đề, công thức 2^h - 1 hay 2^(h+1) - 1 phụ thuộc quy ước.",
        "Nhầm cây hoàn hảo, đầy và hoàn chỉnh – ba khái niệm khác nhau."
      ]
    },
    {
      id: "ch5-l2", title: "Biểu diễn cây và các thao tác cơ bản", minutes: 15,
      sections: [
        {
          heading: "Biểu diễn bằng mảng",
          body: `Đánh số node theo từng mức, từ trái sang phải. Nếu chỉ số bắt đầu từ **0**: node i có con trái ở **2i + 1**, con phải ở **2i + 2**, cha ở **(i - 1) / 2**. (Nếu bắt đầu từ 1: con là 2i và 2i + 1, cha là i / 2.)\n\nPhù hợp với cây hoàn chỉnh (không phí ô trống) – Heap dùng cách này. Với cây suy biến thì rất phí bộ nhớ.`
        },
        {
          heading: "Biểu diễn bằng con trỏ (danh sách liên kết)",
          body: `Mỗi node có dữ liệu và hai con trỏ trái, phải. Đây là cách dùng phổ biến nhất. Cây rỗng là con trỏ gốc bằng NULL.`,
          code: `struct Node {
    int key;
    Node *left, *right;
    Node(int x) : key(x), left(NULL), right(NULL) {}
};

Node *root = NULL;`
        },
        {
          heading: "Các thao tác cơ bản bằng đệ quy",
          body: `Đa số bài về cây giải bằng đệ quy: giải bài toán cho cây con trái, cây con phải rồi kết hợp lại. Chú ý điều kiện dừng khi \`root == NULL\`.`,
          code: `int countNodes(Node *r) {
    if (r == NULL) return 0;
    return 1 + countNodes(r->left) + countNodes(r->right);
}

int countLeaves(Node *r) {
    if (r == NULL) return 0;
    if (r->left == NULL && r->right == NULL) return 1;
    return countLeaves(r->left) + countLeaves(r->right);
}

int height(Node *r) {            // cây rỗng: -1, một node: 0
    if (r == NULL) return -1;
    return 1 + max(height(r->left), height(r->right));
}`,
          complexity: "Mỗi hàm duyệt mọi node một lần: O(n); bộ nhớ ngăn xếp gọi hàm O(h)"
        }
      ],
      keyPoints: [
        "Mảng (gốc chỉ số 0): con trái 2i+1, con phải 2i+2, cha (i-1)/2.",
        "Biểu diễn con trỏ: node gồm key, left, right; cây rỗng = NULL.",
        "Giải bài về cây: xử lý root == NULL rồi gộp kết quả của hai cây con.",
        "Đếm node, đếm lá, tính chiều cao đều O(n)."
      ],
      pitfalls: [
        "Quên trường hợp r == NULL làm crash khi truy cập r->left.",
        "Khi đếm lá, phải kiểm tra cả hai con đều NULL (node chỉ có một con KHÔNG phải lá)."
      ]
    },
    {
      id: "ch5-l3", title: "Duyệt cây: NLR, LNR, LRN và duyệt theo mức", minutes: 20,
      sections: [
        {
          heading: "Ba phép duyệt theo chiều sâu",
          body: `N = thăm node gốc, L = duyệt cây con trái, R = duyệt cây con phải.\n\n- **NLR (tiền thứ tự – preorder)**: Node, Left, Right.\n- **LNR (trung thứ tự – inorder)**: Left, Node, Right.\n- **LRN (hậu thứ tự – postorder)**: Left, Right, Node.\n\nMẹo nhớ: chữ N nằm **đầu / giữa / cuối** tương ứng pre / in / post. Ba phép đều O(n).`,
          code: `void preorder(Node *r) {            // NLR
    if (r == NULL) return;
    cout << r->key << " ";
    preorder(r->left);
    preorder(r->right);
}
void inorder(Node *r) {             // LNR
    if (r == NULL) return;
    inorder(r->left);
    cout << r->key << " ";
    inorder(r->right);
}
void postorder(Node *r) {           // LRN
    if (r == NULL) return;
    postorder(r->left);
    postorder(r->right);
    cout << r->key << " ";
}`,
          complexity: "O(n)"
        },
        {
          heading: "Ví dụ chuẩn để luyện",
          body: `Cho cây (hình vẽ bên dưới): gốc A; B và C là con của A; D, E là con của B; F là con phải của C; G là con trái của E.\n\n- **NLR**: A B D E G C F\n- **LNR**: D B G E A C F\n- **LRN**: D G E B F C A\n- **Theo mức**: A B C D E F G\n\nCách làm khi thi: với mỗi cây con, áp dụng đúng quy tắc từ trên xuống, tránh viết một mạch mà quên cây con.`,
          code: `        A
      /   \\
     B     C
    / \\     \\
   D   E     F
      /
     G`
        },
        {
          heading: "Duyệt theo mức (level order) bằng hàng đợi",
          body: `Duyệt từng mức từ trên xuống, trong mỗi mức từ trái sang phải. Dùng **queue**: đưa gốc vào; lặp: lấy node đầu ra, thăm nó, đưa con trái rồi con phải (nếu có) vào cuối hàng.`,
          code: `void levelOrder(Node *root) {
    if (root == NULL) return;
    queue<Node*> q;
    q.push(root);
    while (!q.empty()) {
        Node *p = q.front(); q.pop();
        cout << p->key << " ";
        if (p->left)  q.push(p->left);
        if (p->right) q.push(p->right);
    }
}`,
          complexity: "O(n) thời gian, O(rộng nhất của cây) bộ nhớ"
        },
        {
          heading: "Dựng lại cây từ hai phép duyệt",
          body: `Biết **inorder** cùng **preorder** (hoặc postorder) thì dựng lại duy nhất một cây (các key khác nhau). Chỉ NLR + LRN thì **không** đủ. Cách làm: phần tử đầu của preorder (hoặc cuối của postorder) là gốc; tìm gốc trong inorder, bên trái là cây con trái, bên phải là cây con phải; làm đệ quy.\n\nVí dụ pre = 1 2 4 5 3 6, in = 4 2 5 1 3 6: gốc 1; inorder trái = {4,2,5}, phải = {3,6}; ... postorder là **4 5 2 6 3 1**.`
        }
      ],
      keyPoints: [
        "NLR: N đầu; LNR: N giữa; LRN: N cuối. Cả ba O(n).",
        "Duyệt theo mức dùng hàng đợi; DFS (NLR/LNR/LRN) dùng đệ quy hoặc stack.",
        "Inorder của BST cho dãy tăng dần.",
        "Cần inorder + (preorder hoặc postorder) để dựng lại cây; preorder + postorder không đủ."
      ],
      pitfalls: [
        "Viết nhầm thứ tự khi duyệt cây có node chỉ có con phải (cây con trái rỗng).",
        "Duyệt theo mức nhưng dùng stack thay vì queue sẽ ra thứ tự sai."
      ]
    },
    {
      id: "ch5-l4", title: "Cây nhị phân tìm kiếm (BST): tìm kiếm và thêm", minutes: 15,
      sections: [
        {
          heading: "Định nghĩa",
          body: `**Cây nhị phân tìm kiếm (BST)** là cây nhị phân mà với **mọi node**: các key ở cây con trái **nhỏ hơn** key node, các key ở cây con phải **lớn hơn** key node (thường quy ước không có key trùng). Hệ quả: duyệt **LNR cho dãy tăng dần**.`
        },
        {
          heading: "Tìm kiếm và thêm",
          body: `**Tìm x**: so sánh với node hiện tại; bằng thì tìm thấy, nhỏ hơn thì sang trái, lớn hơn thì sang phải; gặp NULL thì không có.\n\n**Thêm x**: đi như tìm kiếm tới vị trí NULL, rồi gắn node mới vào đó (luôn thêm ở **lá**). Nếu đã có x thì bỏ qua.\n\nVí dụ thêm lần lượt 8, 3, 10, 1, 6, 14, 4, 7, 13 -> gốc 8, con trái 3 (con 1 và 6; 6 có con 4 và 7), con phải 10 (con phải 14, 14 có con trái 13). Preorder: **8 3 1 6 4 7 10 14 13**.`,
          code: `Node* insert(Node *r, int x) {
    if (r == NULL) return new Node(x);
    if (x < r->key) r->left = insert(r->left, x);
    else if (x > r->key) r->right = insert(r->right, x);
    return r;                     // x trùng thì bỏ qua
}

bool find(Node *r, int x) {
    while (r != NULL) {
        if (x == r->key) return true;
        r = (x < r->key) ? r->left : r->right;
    }
    return false;
}`,
          complexity: "Trung bình O(log n); xấu nhất O(n) khi cây suy biến (ví dụ thêm dãy đã sắp xếp)"
        },
        {
          heading: "Tìm min, max",
          body: `Node nhỏ nhất: đi sang trái mãi tới node không có con trái. Node lớn nhất: đi sang phải mãi. Hai hàm này dùng nhiều khi xoá node.`,
          code: `Node* minNode(Node *r) { while (r->left != NULL) r = r->left; return r; }
Node* maxNode(Node *r) { while (r->right != NULL) r = r->right; return r; }`
        }
      ],
      keyPoints: [
        "BST: trái < node < phải với mọi node; inorder cho dãy tăng dần.",
        "Tìm/thêm đi một nhánh từ gốc xuống: O(h).",
        "Thêm luôn đặt node mới ở vị trí lá.",
        "Thêm dãy đã sắp xếp tạo cây suy biến, h = n - 1, thao tác O(n)."
      ],
      pitfalls: [
        "Chỉ so sánh với con trực tiếp chứ không đảm bảo mọi key của cây con thoả điều kiện BST.",
        "Quên gán lại kết quả đệ quy (r->left = insert(...)) nên node mới không được nối vào cây."
      ]
    },
    {
      id: "ch5-l5", title: "BST: xoá node (3 trường hợp)", minutes: 15,
      sections: [
        {
          heading: "Ba trường hợp",
          body: `Tìm node cần xoá \`z\` rồi xử lý:\n\n1. **z là lá**: xoá trực tiếp (cha trỏ NULL).\n2. **z có đúng một con**: cho cha của z trỏ thẳng tới con đó, xoá z.\n3. **z có hai con**: tìm **node kế nhiệm** – nhỏ nhất của cây con phải (hoặc **tiền nhiệm** – lớn nhất của cây con trái); chép key của nó vào z; rồi xoá node đó khỏi cây con tương ứng (node đó có tối đa một con nên quay về trường hợp 1 hoặc 2).`,
          code: `Node* erase(Node *r, int x) {
    if (r == NULL) return NULL;
    if (x < r->key) r->left = erase(r->left, x);
    else if (x > r->key) r->right = erase(r->right, x);
    else {
        if (r->left == NULL) { Node *t = r->right; delete r; return t; }   // lá hoặc chỉ có con phải
        if (r->right == NULL) { Node *t = r->left; delete r; return t; }   // chỉ có con trái
        Node *s = r->right;                   // hai con: kế nhiệm = min cây con phải
        while (s->left != NULL) s = s->left;
        r->key = s->key;
        r->right = erase(r->right, s->key);
    }
    return r;
}`,
          complexity: "O(h)"
        },
        {
          heading: "Ví dụ",
          body: `Cây thêm lần lượt 50, 30, 70, 20, 40, 60, 80 (preorder 50 30 20 40 70 60 80). Xoá **50** (hai con):\n\n- Dùng **min cây con phải** = 60: gốc mới 60, preorder **60 30 20 40 70 80**.\n- Dùng **max cây con trái** = 40: gốc mới 40, preorder **40 30 20 70 60 80**.\n\nCả hai đều đúng về mặt lý thuyết, nhưng đề thi sẽ chỉ rõ dùng loại nào – hãy đọc kỹ.`
        }
      ],
      keyPoints: [
        "Xoá lá: bỏ ngay; một con: nối cha với con; hai con: thay bằng min cây con phải (hoặc max cây con trái).",
        "Sau khi chép key, phải xoá node kế nhiệm khỏi cây con phải.",
        "Độ phức tạp O(h)."
      ],
      pitfalls: [
        "Chọn sai quy ước kế nhiệm/tiền nhiệm so với đề bài nên preorder kết quả sai.",
        "Quên xoá node kế nhiệm sau khi chép key khiến key bị trùng trong cây."
      ]
    },
    {
      id: "ch5-l6", title: "Cây AVL: cân bằng và 4 phép xoay", minutes: 22,
      sections: [
        {
          heading: "Vì sao cần cây cân bằng?",
          body: `BST thường có thể suy biến thành đường thẳng (thêm 1, 2, 3, ... n) khiến thao tác O(n). **Cây AVL** là BST mà với **mọi node**, chiều cao hai cây con **chênh nhau không quá 1**. Nhờ đó chiều cao luôn O(log n) và tìm/thêm/xoá đều **O(log n)** trong cả trường hợp xấu nhất.\n\n**Hệ số cân bằng** bf(node) = h(cây con trái) - h(cây con phải) thuộc {-1, 0, 1}. Khi thêm/xoá làm bf thành ±2 thì phải **xoay**.\n\nSố node tối thiểu của AVL cao h: N(0)=1, N(1)=2, N(h)=N(h-1)+N(h-2)+1 (dạng Fibonacci): N(2)=4, N(3)=7, N(4)=12.`
        },
        {
          heading: "Bốn trường hợp mất cân bằng",
          body: `Gọi \`z\` là node **thấp nhất** (gần lá nhất) bị mất cân bằng (bf = ±2).\n\n- **LL (lệch trái-trái)**: bf(z) = 2 và bf(con trái) ≥ 0. Sửa: **xoay phải** tại z.\n- **RR (lệch phải-phải)**: bf(z) = -2 và bf(con phải) ≤ 0. Sửa: **xoay trái** tại z.\n- **LR (trái-phải)**: bf(z) = 2 và bf(con trái) < 0. Sửa: **xoay trái** tại con trái rồi **xoay phải** tại z.\n- **RL (phải-trái)**: bf(z) = -2 và bf(con phải) > 0. Sửa: **xoay phải** tại con phải rồi **xoay trái** tại z.\n\nVí dụ nhanh: thêm 10, 20, 30 -> RR, xoay trái, gốc 20. Thêm 30, 20, 10 -> LL, xoay phải, gốc 20. Thêm 30, 10, 20 -> LR, gốc 20. Thêm 10, 30, 20 -> RL, gốc 20.`
        },
        {
          heading: "Cài đặt hai phép xoay cơ bản",
          body: `Xoay phải tại \`y\` với con trái \`x\`: x lên làm gốc, y trở thành con phải của x, cây con phải cũ của x (T2) trở thành con trái của y. Xoay trái đối xứng. Sau khi xoay phải cập nhật chiều cao của node thấp hơn trước rồi mới tới node cao hơn.`,
          code: `struct ANode {
    int key, h;
    ANode *left, *right;
    ANode(int k) : key(k), h(1), left(NULL), right(NULL) {}   // h tính theo số node, lá = 1
};
int H(ANode *p) { return p ? p->h : 0; }
int bf(ANode *p) { return H(p->left) - H(p->right); }
void upd(ANode *p) { p->h = 1 + max(H(p->left), H(p->right)); }

ANode* rotR(ANode *y) {
    ANode *x = y->left, *t2 = x->right;
    x->right = y; y->left = t2;
    upd(y); upd(x);
    return x;
}
ANode* rotL(ANode *x) {
    ANode *y = x->right, *t2 = y->left;
    y->left = x; x->right = t2;
    upd(x); upd(y);
    return y;
}`,
          complexity: "Mỗi phép xoay O(1)"
        }
      ],
      keyPoints: [
        "AVL: BST với |h(trái) - h(phải)| ≤ 1 tại mọi node; chiều cao O(log n).",
        "LL -> xoay phải; RR -> xoay trái; LR -> xoay trái con rồi xoay phải; RL -> xoay phải con rồi xoay trái.",
        "Chỉ cần sửa node mất cân bằng thấp nhất trên đường đi từ lá thêm vào lên gốc.",
        "Thêm vào AVL cần tối đa một lần xoay (đơn hoặc kép); xoá có thể cần xoay ở nhiều mức."
      ],
      pitfalls: [
        "Xác định sai trường hợp: phải nhìn cả hệ số cân bằng của con (bf = 0 sau khi XOÁ vẫn dùng xoay đơn).",
        "Quên cập nhật chiều cao sau khi xoay hoặc cập nhật sai thứ tự (node thấp trước, node cao sau).",
        "Nhầm 'LR' là xoay phải rồi xoay trái; đúng là xoay TRÁI ở con trái trước, rồi xoay phải ở node z."
      ]
    },
    {
      id: "ch5-l7", title: "AVL: thêm node và vẽ từng bước", minutes: 18,
      sections: [
        {
          heading: "Cài đặt thêm vào AVL",
          body: `Thêm như BST (đệ quy), rồi trên đường quay lui từ dưới lên: cập nhật chiều cao, tính bf, nếu |bf| = 2 thì xoay theo đúng trường hợp.`,
          code: `ANode* insertAVL(ANode *r, int x) {
    if (r == NULL) return new ANode(x);
    if (x < r->key) r->left = insertAVL(r->left, x);
    else if (x > r->key) r->right = insertAVL(r->right, x);
    else return r;
    upd(r);
    int b = bf(r);
    if (b > 1 && x < r->left->key)  return rotR(r);                       // LL
    if (b < -1 && x > r->right->key) return rotL(r);                      // RR
    if (b > 1 && x > r->left->key)  { r->left = rotL(r->left); return rotR(r); }    // LR
    if (b < -1 && x < r->right->key) { r->right = rotR(r->right); return rotL(r); } // RL
    return r;
}`,
          complexity: "O(log n)"
        },
        {
          heading: "Ví dụ: thêm 10, 20, 30, 40, 50, 25",
          body: `- Thêm 10, 20: bình thường.\n- Thêm 30: node 10 lệch RR -> xoay trái -> cây 20 (10, 30).\n- Thêm 40: 40 là con phải của 30. Cân bằng.\n- Thêm 50: node 30 lệch RR (30 -> 40 -> 50) -> xoay trái tại 30 -> 40 (30, 50). Cây: 20 (10, 40 (30, 50)).\n- Thêm 25: đi 20 -> 40 -> 30 -> trái của 30. Node 20 có cây con trái cao 1 (node 10), cây con phải cao 3 (40, 30, 25) nên bf = -2; con phải 40 có bf = +1 (> 0) -> trường hợp **RL**: xoay phải tại 40 rồi xoay trái tại 20.\n- Kết quả: gốc 30, trái 20 (10, 25), phải 40 (-, 50).\n\nPreorder cuối cùng: **30 20 10 25 40 50**.\n\nVới dãy 1, 2, ..., 7 thêm lần lượt, AVL cho cây hoàn hảo, gốc 4, preorder **4 2 1 3 6 5 7**.`
        }
      ],
      keyPoints: [
        "Thêm như BST, rồi quay lui cập nhật chiều cao và kiểm tra bf từng node.",
        "Điều kiện chọn xoay dựa trên vị trí x so với con của node mất cân bằng.",
        "Các bài thi thường yêu cầu vẽ cây hoặc cho preorder sau khi thêm dãy khoá.",
        "AVL của 1..7 là cây hoàn hảo gốc 4."
      ],
      pitfalls: [
        "Quên rằng sau khi xoay, node mới ở vị trí cũ phải được gán lại cho cha (return rotR(r)).",
        "Chỉ kiểm tra bf tại gốc, không kiểm tra các node trên đường đi."
      ]
    },
    {
      id: "ch5-l8", title: "Heap (đống) và hàng đợi ưu tiên", minutes: 18,
      sections: [
        {
          heading: "Định nghĩa",
          body: `**Heap** là cây nhị phân **hoàn chỉnh** thoả **tính chất heap**:\n\n- **Max-heap**: key của mỗi node ≥ key của hai con -> gốc là phần tử lớn nhất.\n- **Min-heap**: key của mỗi node ≤ key của hai con -> gốc là phần tử nhỏ nhất.\n\nHeap lưu trong **mảng** (gốc chỉ số 0): con của i là 2i+1, 2i+2; cha là (i-1)/2. Heap **không** sắp xếp toàn bộ, chỉ đảm bảo quan hệ cha-con.`
        },
        {
          heading: "Thêm (sift up) và lấy gốc (sift down)",
          body: `**Thêm x**: đặt x vào cuối mảng rồi **đẩy lên** (swap với cha chừng nào còn lớn hơn cha). O(log n).\n\n**Lấy phần tử gốc**: lấy gốc ra, đưa phần tử **cuối mảng** lên gốc, giảm kích thước, rồi **đẩy xuống** (swap với con lớn hơn trong hai con chừng nào còn nhỏ hơn con). O(log n).\n\nVí dụ max-heap, thêm lần lượt 5, 3, 8, 1, 9: [5] -> [5,3] -> [8,3,5] -> [8,3,5,1] -> [9,8,5,1,3]. Lấy gốc 9: đưa 3 lên gốc [3,8,5,1] -> đẩy xuống [8,3,5,1].`,
          code: `// max-heap trên vector<int> a (0-based)
void siftUp(vector<int> &a, int i) {
    while (i > 0 && a[(i - 1) / 2] < a[i]) {
        swap(a[(i - 1) / 2], a[i]);
        i = (i - 1) / 2;
    }
}
void siftDown(vector<int> &a, int n, int i) {
    while (true) {
        int l = 2 * i + 1, r = 2 * i + 2, big = i;
        if (l < n && a[l] > a[big]) big = l;
        if (r < n && a[r] > a[big]) big = r;
        if (big == i) break;
        swap(a[i], a[big]);
        i = big;
    }
}
void push(vector<int> &a, int x) { a.push_back(x); siftUp(a, a.size() - 1); }
int pop(vector<int> &a) {                   // lấy phần tử lớn nhất
    int top = a[0];
    a[0] = a.back(); a.pop_back();
    if (!a.empty()) siftDown(a, a.size(), 0);
    return top;
}`,
          complexity: "push, pop: O(log n); xem gốc: O(1)"
        },
        {
          heading: "Dựng heap và heap sort",
          body: `**Dựng heap từ mảng** (heapify): gọi siftDown cho các node trong từ **n/2 - 1 về 0**; tổng chỉ **O(n)**. Ví dụ [4,10,3,5,1] -> max-heap [10,5,3,4,1].\n\n**Heap sort**: dựng max-heap, lặp: đổi a[0] với phần tử cuối, giảm kích thước, siftDown. Độ phức tạp O(n log n), không cần bộ nhớ phụ.\n\n**Mở rộng.** \`priority_queue\` của STL chính là heap; \`make_heap\`, \`push_heap\`, \`pop_heap\` thao tác trên vector.`
        }
      ],
      keyPoints: [
        "Heap = cây hoàn chỉnh + tính chất cha ≥ con (max) hoặc cha ≤ con (min).",
        "Thêm: đặt cuối rồi sift up; lấy gốc: đưa phần tử cuối lên gốc rồi sift down.",
        "push/pop O(log n); dựng heap từ mảng O(n); heap sort O(n log n).",
        "Heap là cách cài chuẩn của hàng đợi ưu tiên."
      ],
      pitfalls: [
        "Nhầm heap với BST: heap không có quan hệ trái < phải, không cho dãy sắp xếp khi duyệt inorder.",
        "Khi sift down quên chọn con LỚN hơn (max-heap) trong hai con để đổi.",
        "Sai chỉ số con khi mảng bắt đầu từ 0 và từ 1."
      ]
    }
  ],
  flashcards: [
    { front: "Chiều cao h (gốc mức 0): cây nhị phân có tối đa bao nhiêu node?", back: "2^(h+1) - 1 node; mức i có tối đa 2^i node." },
    { front: "Quan hệ giữa số lá n0 và số node bậc 2 n2?", back: "n0 = n2 + 1." },
    { front: "Phân biệt cây nhị phân đầy, hoàn hảo, hoàn chỉnh?", back: "Đầy: mọi node 0 hoặc 2 con. Hoàn hảo: mọi mức đủ, lá cùng mức. Hoàn chỉnh: đủ các mức trừ mức cuối dồn trái (Heap)." },
    { front: "Biểu diễn cây bằng mảng (gốc chỉ số 0): con và cha của node i?", back: "Con trái 2i+1, con phải 2i+2, cha (i-1)/2." },
    { front: "NLR, LNR, LRN là gì?", back: "Preorder (Node-Left-Right), Inorder (Left-Node-Right), Postorder (Left-Right-Node)." },
    { front: "Duyệt theo mức dùng cấu trúc nào?", back: "Hàng đợi (queue): lấy node ra, đưa con trái rồi con phải vào cuối." },
    { front: "Duyệt nào của BST cho dãy tăng dần?", back: "Duyệt trung thứ tự LNR (inorder)." },
    { front: "Cần những phép duyệt nào để dựng lại cây duy nhất?", back: "Inorder cùng với preorder hoặc postorder. Preorder + postorder không đủ." },
    { front: "Định nghĩa BST?", back: "Mọi node: key cây con trái < key node < key cây con phải." },
    { front: "Độ phức tạp tìm/thêm/xoá trên BST thường?", back: "O(h): trung bình O(log n), xấu nhất O(n) khi cây suy biến (thêm dãy đã sắp xếp)." },
    { front: "Xoá node có hai con trong BST?", back: "Thay key bằng node nhỏ nhất của cây con phải (hoặc lớn nhất cây con trái), rồi xoá node đó." },
    { front: "Hệ số cân bằng và điều kiện của AVL?", back: "bf = h(trái) - h(phải) ∈ {-1, 0, 1} tại mọi node; chiều cao O(log n)." },
    { front: "Bốn trường hợp mất cân bằng AVL và cách sửa?", back: "LL: xoay phải. RR: xoay trái. LR: xoay trái con trái rồi xoay phải. RL: xoay phải con phải rồi xoay trái." },
    { front: "Thêm 10, 20, 30 vào AVL rỗng, gốc cuối là?", back: "20 (RR, xoay trái tại 10), hai con là 10 và 30." },
    { front: "Heap là gì? Max-heap khác min-heap thế nào?", back: "Cây nhị phân hoàn chỉnh, cha ≥ con (max) hoặc cha ≤ con (min); gốc là max hoặc min." },
    { front: "Heap: thêm và lấy gốc làm thế nào?", back: "Thêm: đặt cuối rồi sift up. Lấy gốc: đưa phần tử cuối lên gốc rồi sift down. Đều O(log n)." },
    { front: "Dựng heap từ mảng n phần tử có độ phức tạp?", back: "O(n): sift down từ n/2-1 về 0 (không phải O(n log n))." }
  ],
  quiz: [
    {
      id: "ch5-q1",
      question: "Cho cây nhị phân sau. Kết quả duyệt NLR (tiền thứ tự) là?",
      code: `        A
      /   \\
     B     C
    / \\     \\
   D   E     F
      /
     G`,
      options: ["A B D E G C F", "D B G E A C F", "D G E B F C A", "A B C D E F G"], answer: 0,
      explanation: "NLR: thăm gốc A, rồi cây con trái B (B, D, rồi E và con G của E), rồi cây con phải C (C, F): A B D E G C F. Đáp án 2 là LNR, 3 là LRN, 4 là duyệt theo mức."
    },
    {
      id: "ch5-q2",
      question: "Với cây trong câu trước (gốc A, B có con D và E, E có con trái G, C có con phải F), kết quả duyệt LNR (trung thứ tự) là?",
      options: ["D G E B F C A", "D B G E A C F", "A B D E G C F", "D E G B A C F"], answer: 1,
      explanation: "LNR: cây con trái của A cho D B G E (D, B, rồi cây con phải của B là G E), sau đó A, rồi cây con phải C cho C F: D B G E A C F."
    },
    {
      id: "ch5-q3",
      question: "Với cây trong câu trước, kết quả duyệt LRN (hậu thứ tự) là?",
      options: ["A B C D E F G", "D B G E A C F", "D G E B F C A", "G E D B F C A"], answer: 2,
      explanation: "LRN: cây con B cho D, (G E), B tức D G E B; cây con C cho F C; cuối cùng là gốc A: D G E B F C A. Gốc luôn là phần tử cuối trong hậu thứ tự."
    },
    {
      id: "ch5-q4",
      question: "Với cây trong câu trước, kết quả duyệt theo mức (level order) là?",
      options: ["A B D E G C F", "D G E B F C A", "D B G E A C F", "A B C D E F G"], answer: 3,
      explanation: "Mức 0: A; mức 1: B C; mức 2: D E F (E có con trái G ở mức 3, F là con phải của C ở mức 2); mức 3: G. Kết quả: A B C D E F G."
    },
    {
      id: "ch5-q5",
      question: "Một cây nhị phân có 5 node bậc 2 (có đủ hai con). Số lá của cây là?",
      options: ["6", "5", "4", "7"], answer: 0,
      explanation: "Với mọi cây nhị phân, n0 = n2 + 1 = 5 + 1 = 6."
    },
    {
      id: "ch5-q6",
      question: "Cây nhị phân có chiều cao h = 3 (tính bằng số cạnh, cây một node có h = 0) chứa tối đa bao nhiêu node?",
      options: ["7", "8", "15", "16"], answer: 2,
      explanation: "Tối đa 2^(h+1) - 1 = 2^4 - 1 = 15 (mức 0..3 có 1+2+4+8 node). 7 là kết quả nếu h = 2."
    },
    {
      id: "ch5-q7",
      question: "Phép duyệt nào của cây nhị phân tìm kiếm cho dãy khoá sắp xếp tăng dần?",
      options: ["Tiền thứ tự (NLR)", "Trung thứ tự (LNR)", "Hậu thứ tự (LRN)", "Duyệt theo mức"], answer: 1,
      explanation: "Với BST, mọi key bên trái nhỏ hơn node và bên phải lớn hơn, nên duyệt Left - Node - Right thăm các key theo thứ tự tăng dần."
    },
    {
      id: "ch5-q8",
      question: "Thêm lần lượt các khoá 8, 3, 10, 1, 6, 14, 4, 7, 13 vào BST rỗng. Kết quả duyệt NLR là?",
      options: ["1 3 4 6 7 8 10 13 14", "8 3 10 1 6 14 4 7 13", "8 3 1 6 7 4 10 14 13", "8 3 1 6 4 7 10 14 13"], answer: 3,
      explanation: "Cây: gốc 8; trái 3 (con 1 và 6, 6 có con 4 và 7); phải 10 (con phải 14, 14 có con trái 13). NLR: 8 3 1 6 4 7 10 14 13. Đáp án 1 là LNR; đáp án 2 là thứ tự thêm vào."
    },
    {
      id: "ch5-q9",
      question: "Khi xoá một node có hai con khỏi BST, cách làm chuẩn là?",
      options: ["Thay bằng node nhỏ nhất của cây con phải (hoặc lớn nhất của cây con trái) rồi xoá node đó", "Xoá node và nối cả hai con vào cha", "Thay bằng con trái của nó", "Xoá toàn bộ cây con phải"], answer: 0,
      explanation: "Chỉ có node kế nhiệm (min cây con phải) hoặc tiền nhiệm (max cây con trái) mới giữ được tính chất BST. Nối cả hai con vào cha không thực hiện được (cha chỉ có một chỗ); các cách còn lại làm mất hoặc phá thứ tự các khoá."
    },
    {
      id: "ch5-q10",
      question: "Thêm lần lượt các khoá 1, 2, 3, ..., n vào BST thường. Độ phức tạp tìm kiếm khoá n trong cây thu được là?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], answer: 0,
      explanation: "Cây suy biến thành một đường nghiêng phải có chiều cao n - 1 nên tìm khoá n phải đi qua n node: O(n). Đây là lý do cần cây cân bằng AVL."
    },
    {
      id: "ch5-q11",
      question: "BST được tạo bằng cách thêm 50, 30, 70, 20, 40, 60, 80. Xoá node 50, thay bằng node nhỏ nhất của cây con phải. Kết quả NLR của cây sau khi xoá là?",
      options: ["40 30 20 70 60 80", "60 30 20 40 70 80", "30 20 40 70 60 80", "70 30 20 40 60 80"], answer: 1,
      explanation: "Node nhỏ nhất của cây con phải (gốc 70) là 60. Gốc mới 60, 60 bị xoá khỏi vị trí cũ (là lá). Cây: 60 (30 (20, 40), 70 (-, 80)); NLR: 60 30 20 40 70 80. Đáp án 1 là kết quả nếu dùng lớn nhất của cây con trái (40)."
    },
    {
      id: "ch5-q12",
      question: "Thêm lần lượt 10, 20, 30 vào cây AVL rỗng. Khi thêm 30, node 10 mất cân bằng và cần thực hiện?",
      options: ["Xoay phải (trường hợp LL)", "Xoay trái (trường hợp RR)", "Xoay trái-phải (trường hợp LR)", "Xoay phải-trái (trường hợp RL)"], answer: 1,
      explanation: "10 -> 20 -> 30 là một đường nghiêng phải (RR), sửa bằng một phép xoay trái tại 10, được cây gốc 20 với hai con 10 và 30."
    },
    {
      id: "ch5-q13",
      question: "Thêm lần lượt 30, 10, 20 vào cây AVL rỗng. Khi thêm 20, node 30 mất cân bằng; loại mất cân bằng và cách sửa là?",
      options: ["LL: xoay phải", "RR: xoay trái", "LR: xoay trái tại 10 rồi xoay phải tại 30", "RL: xoay phải tại 30 rồi xoay trái"], answer: 2,
      explanation: "20 là con phải của 10, và 10 là con trái của 30: dạng gấp khúc trái-phải (LR). Xoay trái tại 10 đưa 20 lên làm con trái của 30, rồi xoay phải tại 30 đưa 20 lên gốc."
    },
    {
      id: "ch5-q14",
      question: "Max-heap lưu trong mảng [9, 8, 5, 1, 3]. Sau khi lấy phần tử lớn nhất (đưa phần tử cuối lên gốc rồi sift down), mảng là?",
      options: ["3 8 5 1", "8 5 3 1", "8 1 5 3", "8 3 5 1"], answer: 3,
      explanation: "Lấy 9, đưa 3 lên gốc: [3, 8, 5, 1]. 3 nhỏ hơn con lớn nhất là 8, đổi chỗ: [8, 3, 5, 1]. Con của vị trí 1 là vị trí 3 (giá trị 1) nhỏ hơn 3 nên dừng."
    },
    {
      id: "ch5-q15",
      question: "Thêm lần lượt 5, 3, 8, 1, 9 vào max-heap rỗng. Mảng biểu diễn heap cuối cùng là?",
      options: ["9 8 5 1 3", "9 5 8 1 3", "9 3 8 1 5", "8 9 5 1 3"], answer: 0,
      explanation: "[5] -> [5,3] -> thêm 8: [5,3,8] sift up: [8,3,5] -> thêm 1: [8,3,5,1] -> thêm 9 ở vị trí 4, cha là 3 (đổi) rồi cha là 8 (đổi): [9,8,5,1,3]."
    },
    {
      id: "ch5-q16",
      question: "Cây AVL có chiều cao 3 (cây một node có chiều cao 0) có ít nhất bao nhiêu node?",
      options: ["5", "6", "7", "8"], answer: 2,
      explanation: "Gọi N(h) là số node tối thiểu: N(0)=1, N(1)=2, N(h)=N(h-1)+N(h-2)+1. Vậy N(2)=2+1+1=4, N(3)=4+2+1=7."
    }
  ],
  exercises: [
    {
      id: "ch5-e1", title: "Thêm vào BST và in trung thứ tự", difficulty: "Dễ",
      statement: `Cho n khoá nguyên. Thêm lần lượt vào cây nhị phân tìm kiếm rỗng (khoá đã có thì bỏ qua), rồi in kết quả duyệt LNR.\n\n**Input**: dòng đầu n (1 ≤ n ≤ 10^4), dòng sau n số nguyên.\n\n**Output**: các khoá theo thứ tự LNR, cách nhau một khoảng trắng.\n\n**Ví dụ**\n\nInput:\n8\n5 3 8 3 1 4 9 5\n\nOutput:\n1 3 4 5 8 9`,
      hint: "Viết hàm insert đệ quy trả về con trỏ gốc mới. Duyệt LNR cho dãy tăng dần.",
      solution: `#include <iostream>
using namespace std;

struct Node {
    int key;
    Node *left, *right;
    Node(int x) : key(x), left(NULL), right(NULL) {}
};

Node* insert(Node *r, int x) {
    if (r == NULL) return new Node(x);
    if (x < r->key) r->left = insert(r->left, x);
    else if (x > r->key) r->right = insert(r->right, x);
    return r;
}

bool firstOut = true;
void inorder(Node *r) {
    if (r == NULL) return;
    inorder(r->left);
    if (!firstOut) cout << " ";
    cout << r->key;
    firstOut = false;
    inorder(r->right);
}

int main() {
    int n;
    cin >> n;
    Node *root = NULL;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        root = insert(root, x);
    }
    inorder(root);
    cout << endl;
    return 0;
}`,
      complexity: "Trung bình O(n log n); xấu nhất O(n^2)"
    },
    {
      id: "ch5-e2", title: "Đếm node, lá và chiều cao BST", difficulty: "Dễ",
      statement: `Thêm n khoá (khác nhau) lần lượt vào BST rỗng. In ra ba số: số node, số lá, chiều cao (tính bằng số cạnh; cây một node có chiều cao 0).\n\n**Input**: dòng đầu n (1 ≤ n ≤ 5000), dòng sau n số nguyên khác nhau.\n\n**Output**: ba số cách nhau một khoảng trắng.\n\n**Ví dụ**\n\nInput:\n7\n50 30 70 20 40 60 80\n\nOutput:\n7 4 2`,
      hint: "Ba hàm đệ quy: countNodes, countLeaves, height. Lá là node có cả hai con NULL; height(NULL) = -1.",
      solution: `#include <algorithm>
#include <iostream>
using namespace std;

struct Node {
    int key;
    Node *left, *right;
    Node(int x) : key(x), left(NULL), right(NULL) {}
};

Node* insert(Node *r, int x) {
    if (r == NULL) return new Node(x);
    if (x < r->key) r->left = insert(r->left, x);
    else if (x > r->key) r->right = insert(r->right, x);
    return r;
}

int countNodes(Node *r) {
    return r == NULL ? 0 : 1 + countNodes(r->left) + countNodes(r->right);
}

int countLeaves(Node *r) {
    if (r == NULL) return 0;
    if (r->left == NULL && r->right == NULL) return 1;
    return countLeaves(r->left) + countLeaves(r->right);
}

int height(Node *r) {
    if (r == NULL) return -1;
    return 1 + max(height(r->left), height(r->right));
}

int main() {
    int n;
    cin >> n;
    Node *root = NULL;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        root = insert(root, x);
    }
    cout << countNodes(root) << " " << countLeaves(root) << " " << height(root) << endl;
    return 0;
}`,
      complexity: "O(n·h) khi dựng cây, O(n) mỗi lần đếm"
    },
    {
      id: "ch5-e3", title: "Duyệt theo mức của BST", difficulty: "Vừa",
      statement: `Thêm n khoá (khác nhau) lần lượt vào BST rỗng rồi in kết quả duyệt theo mức (từ trên xuống, trái sang phải).\n\n**Input**: dòng đầu n (1 ≤ n ≤ 10^4), dòng sau n số nguyên khác nhau.\n\n**Output**: các khoá theo thứ tự duyệt theo mức, cách nhau một khoảng trắng.\n\n**Ví dụ**\n\nInput:\n6\n5 3 8 7 2 4\n\nOutput:\n5 3 8 2 4 7`,
      hint: "Dùng queue<Node*>: đưa gốc vào, lặp lấy đầu hàng, in, rồi đưa con trái và con phải (nếu có).",
      solution: `#include <iostream>
#include <queue>
using namespace std;

struct Node {
    int key;
    Node *left, *right;
    Node(int x) : key(x), left(NULL), right(NULL) {}
};

Node* insert(Node *r, int x) {
    if (r == NULL) return new Node(x);
    if (x < r->key) r->left = insert(r->left, x);
    else if (x > r->key) r->right = insert(r->right, x);
    return r;
}

int main() {
    int n;
    cin >> n;
    Node *root = NULL;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        root = insert(root, x);
    }
    queue<Node*> q;
    q.push(root);
    bool first = true;
    while (!q.empty()) {
        Node *p = q.front();
        q.pop();
        if (!first) cout << " ";
        cout << p->key;
        first = false;
        if (p->left) q.push(p->left);
        if (p->right) q.push(p->right);
    }
    cout << endl;
    return 0;
}`,
      complexity: "O(n·h) dựng cây + O(n) duyệt"
    },
    {
      id: "ch5-e4", title: "Từ tiền thứ tự BST sang hậu thứ tự", difficulty: "Vừa",
      statement: `Cho kết quả duyệt NLR (tiền thứ tự) của một cây nhị phân tìm kiếm gồm n khoá khác nhau. Hãy in kết quả duyệt LRN (hậu thứ tự) của cây đó.\n\n**Input**: dòng đầu n (1 ≤ n ≤ 10^4), dòng sau n số nguyên là NLR.\n\n**Output**: n số là LRN.\n\n**Ví dụ**\n\nInput:\n7\n50 30 20 40 70 60 80\n\nOutput:\n20 40 30 60 80 70 50`,
      hint: "Thêm lần lượt các khoá theo thứ tự NLR vào BST rỗng thì thu lại đúng cây ban đầu. Sau đó duyệt LRN.",
      solution: `#include <iostream>
using namespace std;

struct Node {
    int key;
    Node *left, *right;
    Node(int x) : key(x), left(NULL), right(NULL) {}
};

Node* insert(Node *r, int x) {
    if (r == NULL) return new Node(x);
    if (x < r->key) r->left = insert(r->left, x);
    else r->right = insert(r->right, x);
    return r;
}

bool first = true;
void postorder(Node *r) {
    if (r == NULL) return;
    postorder(r->left);
    postorder(r->right);
    if (!first) cout << " ";
    cout << r->key;
    first = false;
}

int main() {
    int n;
    cin >> n;
    Node *root = NULL;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        root = insert(root, x);
    }
    postorder(root);
    cout << endl;
    return 0;
}`,
      complexity: "O(n·h)"
    },
    {
      id: "ch5-e5", title: "BST với thêm, xoá, tìm", difficulty: "Vừa",
      statement: `Cài đặt BST số nguyên với các thao tác (Q thao tác):\n\n- \`insert x\`: thêm x (đã có thì bỏ qua).\n- \`delete x\`: xoá x nếu có. Nếu x có hai con, thay bằng **node nhỏ nhất của cây con phải**.\n- \`find x\`: in \`YES\` nếu có x, ngược lại \`NO\`.\n\nSau tất cả thao tác, in một dòng là kết quả duyệt LNR (nếu cây rỗng in \`EMPTY\`).\n\n**Input**: dòng đầu Q (≤ 10^4), sau đó Q dòng thao tác.\n\n**Ví dụ**\n\nInput:\n8\ninsert 50\ninsert 30\ninsert 70\ndelete 50\nfind 50\nfind 70\ninsert 60\nfind 60\n\nOutput:\nNO\nYES\nYES\n30 60 70`,
      hint: "Hàm erase đệ quy: tách ba trường hợp lá / một con / hai con. Với hai con: tìm min cây con phải, chép key, xoá node đó trong cây con phải.",
      solution: `#include <iostream>
#include <string>
using namespace std;

struct Node {
    int key;
    Node *left, *right;
    Node(int x) : key(x), left(NULL), right(NULL) {}
};

Node* insert(Node *r, int x) {
    if (r == NULL) return new Node(x);
    if (x < r->key) r->left = insert(r->left, x);
    else if (x > r->key) r->right = insert(r->right, x);
    return r;
}

Node* erase(Node *r, int x) {
    if (r == NULL) return NULL;
    if (x < r->key) {
        r->left = erase(r->left, x);
    } else if (x > r->key) {
        r->right = erase(r->right, x);
    } else {
        if (r->left == NULL) { Node *t = r->right; delete r; return t; }
        if (r->right == NULL) { Node *t = r->left; delete r; return t; }
        Node *s = r->right;
        while (s->left != NULL) s = s->left;
        r->key = s->key;
        r->right = erase(r->right, s->key);
    }
    return r;
}

bool find(Node *r, int x) {
    while (r != NULL) {
        if (x == r->key) return true;
        r = (x < r->key) ? r->left : r->right;
    }
    return false;
}

bool first = true;
void inorder(Node *r) {
    if (r == NULL) return;
    inorder(r->left);
    if (!first) cout << " ";
    cout << r->key;
    first = false;
    inorder(r->right);
}

int main() {
    int q;
    cin >> q;
    Node *root = NULL;
    while (q--) {
        string cmd;
        int x;
        cin >> cmd >> x;
        if (cmd == "insert") root = insert(root, x);
        else if (cmd == "delete") root = erase(root, x);
        else cout << (find(root, x) ? "YES" : "NO") << endl;
    }
    if (root == NULL) cout << "EMPTY";
    else inorder(root);
    cout << endl;
    return 0;
}`,
      complexity: "Mỗi thao tác O(h)"
    },
    {
      id: "ch5-e6", title: "Dựng cây từ NLR và LNR, in LRN", difficulty: "Khó",
      statement: `Cho kết quả duyệt NLR và LNR của một cây nhị phân (không nhất thiết là BST) gồm n khoá khác nhau. Hãy in kết quả duyệt LRN.\n\n**Input**: dòng đầu n (1 ≤ n ≤ 10^5), dòng hai là NLR, dòng ba là LNR.\n\n**Output**: n số là LRN, cách nhau khoảng trắng.\n\n**Ví dụ**\n\nInput:\n6\n1 2 4 5 3 6\n4 2 5 1 3 6\n\nOutput:\n4 5 2 6 3 1`,
      hint: "Phần tử đầu của NLR là gốc. Tìm vị trí gốc trong LNR (dùng bảng vị trí) để biết kích thước cây con trái. Đệ quy cho hai cây con, in gốc sau cùng. Cây có thể sâu 10^5 – đệ quy vẫn ổn trên đa số máy chấm, hoặc dùng chỉ số thay vì sao chép mảng.",
      solution: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

int n;
vector<int> pre, in, res;
unordered_map<int, int> pos;

// pre[ps..ps+len-1] là NLR, in[is..is+len-1] là LNR của cùng một cây con
void build(int ps, int is, int len) {
    if (len <= 0) return;
    int root = pre[ps];
    int k = pos[root] - is;              // số node của cây con trái
    build(ps + 1, is, k);
    build(ps + 1 + k, is + k + 1, len - k - 1);
    res.push_back(root);                 // LRN: gốc ở cuối
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    cin >> n;
    pre.resize(n);
    in.resize(n);
    for (int i = 0; i < n; i++) cin >> pre[i];
    for (int i = 0; i < n; i++) cin >> in[i];
    for (int i = 0; i < n; i++) pos[in[i]] = i;
    build(0, 0, n);
    for (int i = 0; i < n; i++) cout << res[i] << (i + 1 < n ? " " : "\\n");
    return 0;
}`,
      complexity: "O(n)"
    },
    {
      id: "ch5-e7", title: "Thêm vào cây AVL và in tiền thứ tự", difficulty: "Khó",
      statement: `Thêm lần lượt n khoá khác nhau vào cây AVL rỗng (tự cân bằng bằng 4 phép xoay). In kết quả duyệt NLR của cây thu được.\n\n**Input**: dòng đầu n (1 ≤ n ≤ 10^5), dòng sau n số nguyên khác nhau.\n\n**Output**: n khoá theo NLR, cách nhau khoảng trắng.\n\n**Ví dụ**\n\nInput:\n6\n10 20 30 40 50 25\n\nOutput:\n30 20 10 25 40 50`,
      hint: "Lưu chiều cao trong mỗi node. Sau khi thêm đệ quy, cập nhật chiều cao, tính hệ số cân bằng, và chọn LL/RR/LR/RL dựa vào khoá vừa thêm so với khoá của con.",
      solution: `#include <algorithm>
#include <iostream>
using namespace std;

struct Node {
    int key, h;
    Node *left, *right;
    Node(int k) : key(k), h(1), left(NULL), right(NULL) {}
};

int H(Node *p) { return p ? p->h : 0; }
int bf(Node *p) { return H(p->left) - H(p->right); }
void upd(Node *p) { p->h = 1 + max(H(p->left), H(p->right)); }

Node* rotR(Node *y) {
    Node *x = y->left, *t2 = x->right;
    x->right = y;
    y->left = t2;
    upd(y);
    upd(x);
    return x;
}

Node* rotL(Node *x) {
    Node *y = x->right, *t2 = y->left;
    y->left = x;
    x->right = t2;
    upd(x);
    upd(y);
    return y;
}

Node* insert(Node *r, int x) {
    if (r == NULL) return new Node(x);
    if (x < r->key) r->left = insert(r->left, x);
    else if (x > r->key) r->right = insert(r->right, x);
    else return r;
    upd(r);
    int b = bf(r);
    if (b > 1 && x < r->left->key) return rotR(r);                     // LL
    if (b < -1 && x > r->right->key) return rotL(r);                   // RR
    if (b > 1 && x > r->left->key) {                                   // LR
        r->left = rotL(r->left);
        return rotR(r);
    }
    if (b < -1 && x < r->right->key) {                                 // RL
        r->right = rotR(r->right);
        return rotL(r);
    }
    return r;
}

bool first = true;
void preorder(Node *r) {
    if (r == NULL) return;
    if (!first) cout << " ";
    cout << r->key;
    first = false;
    preorder(r->left);
    preorder(r->right);
}

int main() {
    int n;
    cin >> n;
    Node *root = NULL;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        root = insert(root, x);
    }
    preorder(root);
    cout << endl;
    return 0;
}`,
      complexity: "O(n log n)"
    }
  ]
});
window.DSA_CHAPTERS.push({
  id: "ch6", number: 6, title: "Đồ thị",
  summary: "Khái niệm và biểu diễn đồ thị, duyệt BFS/DFS và ứng dụng, đồ thị Euler, cây khung (DFS/BFS, Kruskal, Prim) và đường đi ngắn nhất (Dijkstra, Bellman-Ford, Floyd).",
  examWeight: "Cao",
  lessons: [
    {
      id: "ch6-l1", title: "Khái niệm và thuật ngữ về đồ thị", minutes: 15,
      sections: [
        {
          heading: "Định nghĩa",
          body: `**Đồ thị** G = (V, E) gồm tập **đỉnh** V (n = |V|) và tập **cạnh** E (m = |E|). Mỗi cạnh nối hai đỉnh.\n\n- **Đồ thị vô hướng**: cạnh (u, v) = (v, u), không phân biệt chiều.\n- **Đồ thị có hướng**: cung (u, v) đi từ u tới v, khác (v, u).\n- **Đồ thị có trọng số**: mỗi cạnh có một giá trị (độ dài, chi phí...).\n- **Cạnh song song**: nhiều cạnh cùng nối một cặp đỉnh. **Khuyên**: cạnh nối đỉnh với chính nó. **Đơn đồ thị**: không có cạnh song song và khuyên.`
        },
        {
          heading: "Bậc của đỉnh",
          body: `Đồ thị vô hướng: **bậc deg(v)** là số cạnh kề với v. **Định lý bắt tay**: tổng bậc mọi đỉnh = **2m**. Hệ quả: số đỉnh bậc lẻ luôn **chẵn**. Ví dụ đồ thị 6 đỉnh 10 cạnh có tổng bậc 20.\n\nĐồ thị có hướng: **bán bậc ra** deg+(v) (số cung đi ra) và **bán bậc vào** deg-(v); tổng bán bậc ra = tổng bán bậc vào = m.`
        },
        {
          heading: "Đường đi, chu trình, liên thông",
          body: `- **Đường đi** từ u tới v: dãy đỉnh liên tiếp kề nhau; độ dài là số cạnh (hoặc tổng trọng số). **Chu trình**: đường đi bắt đầu và kết thúc cùng một đỉnh.\n- **Đồ thị vô hướng liên thông**: giữa hai đỉnh bất kỳ có đường đi. Nếu không, đồ thị chia thành các **thành phần liên thông**.\n- **Cây**: đồ thị vô hướng liên thông không có chu trình; n đỉnh có đúng **n - 1** cạnh.\n- Đồ thị có hướng: **liên thông mạnh** nếu từ mọi đỉnh tới được mọi đỉnh khác theo chiều cung.\n\nMột số dạng đặc biệt: **đồ thị đầy đủ** K_n (mọi cặp đỉnh có cạnh, m = n(n-1)/2), **đồ thị hai phía** (chia được V thành hai tập sao cho mọi cạnh nối hai tập khác nhau), **đồ thị phẳng**.`
        }
      ],
      keyPoints: [
        "G = (V, E); vô hướng khác có hướng; có thể có trọng số.",
        "Tổng bậc mọi đỉnh = 2 × số cạnh; số đỉnh bậc lẻ là số chẵn.",
        "Liên thông: mọi cặp đỉnh có đường đi; không liên thông thì chia thành các thành phần liên thông.",
        "Cây: liên thông, không chu trình, n đỉnh có n - 1 cạnh."
      ],
      pitfalls: [
        "Quên rằng đồ thị vô hướng, mỗi cạnh được đếm hai lần trong tổng bậc.",
        "Nhầm 'đường đi' (không lặp cạnh/đỉnh) với 'đường đi bất kỳ' hay 'chu trình'."
      ]
    },
    {
      id: "ch6-l2", title: "Biểu diễn đồ thị: ma trận kề, danh sách kề, danh sách cạnh", minutes: 20,
      sections: [
        {
          heading: "Ma trận kề",
          body: `Ma trận vuông A cấp n: A[i][j] = 1 nếu có cạnh (i, j), ngược lại 0 (đồ thị có trọng số: A[i][j] = trọng số, ∞ nếu không có cạnh).\n\n- Đồ thị vô hướng: A **đối xứng** qua đường chéo chính; tổng hàng i = deg(i).\n- Kiểm tra cạnh (u, v): **O(1)**. Bộ nhớ **O(n²)**. Duyệt các đỉnh kề của u: O(n).\n- Phù hợp đồ thị **dày** hoặc n nhỏ (n ≤ 1000), thuật toán Floyd.`
        },
        {
          heading: "Danh sách kề",
          body: `Mỗi đỉnh u có một danh sách các đỉnh kề (và trọng số). Bộ nhớ **O(n + m)**; duyệt các đỉnh kề của u tốn O(deg(u)); kiểm tra cạnh (u, v) tốn O(deg(u)). Phù hợp đồ thị **thưa** – dạng dùng nhiều nhất trong thi lập trình.\n\nTrong C++ dùng \`vector<int> adj[N]\` hoặc \`vector<vector<int>>\` (và \`vector<pair<int,int>>\` cho (đỉnh, trọng số)). Với đồ thị vô hướng nhớ thêm cạnh theo **cả hai chiều**. **Mở rộng**: sắp xếp từng danh sách kề tăng dần để duyệt đỉnh theo thứ tự nhỏ trước.`,
          code: `int n, m;
cin >> n >> m;
vector<vector<int>> adj(n + 1);          // đỉnh đánh số 1..n
for (int i = 0; i < m; i++) {
    int u, v;
    cin >> u >> v;
    adj[u].push_back(v);
    adj[v].push_back(u);                 // bỏ dòng này nếu đồ thị có hướng
}
for (int u = 1; u <= n; u++) sort(adj[u].begin(), adj[u].end());`,
          complexity: "Bộ nhớ O(n + m)"
        },
        {
          heading: "Danh sách cạnh",
          body: `Lưu mảng các bộ ba (u, v, w). Bộ nhớ **O(m)**. Tìm đỉnh kề của một đỉnh phải duyệt cả m cạnh nên không phù hợp cho BFS/DFS, nhưng rất tiện cho **Kruskal** (cần sắp xếp theo trọng số) và **Bellman-Ford** (duyệt mọi cạnh).`,
          code: `struct Edge { int u, v, w; };
vector<Edge> edges;
edges.push_back({1, 2, 7});
sort(edges.begin(), edges.end(), [](const Edge &a, const Edge &b) { return a.w < b.w; });`
        },
        {
          heading: "Chuyển đổi giữa các biểu diễn",
          body: `- **Ma trận kề -> danh sách kề**: với mỗi i, j nếu A[i][j] != 0 thì thêm j vào adj[i]. O(n²).\n- **Danh sách kề -> ma trận kề**: với mỗi u và mỗi v trong adj[u] đặt A[u][v] = 1. O(n² + m).\n- **Danh sách cạnh -> danh sách kề**: duyệt từng cạnh, thêm vào adj (hai chiều nếu vô hướng). O(n + m).\n\nBảng chọn nhanh: kiểm tra cạnh O(1) cần ma trận; BFS/DFS trên đồ thị thưa cần danh sách kề; Kruskal cần danh sách cạnh.`,
          code: `// ma trận kề a[1..n][1..n] -> danh sách kề
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= n; j++)
        if (a[i][j]) adj[i].push_back(j);`
        }
      ],
      keyPoints: [
        "Ma trận kề: O(n²) bộ nhớ, kiểm tra cạnh O(1), đối xứng nếu vô hướng.",
        "Danh sách kề: O(n + m), duyệt kề O(deg), tốt cho đồ thị thưa.",
        "Danh sách cạnh: O(m), tiện cho Kruskal và Bellman-Ford.",
        "Đồ thị vô hướng: thêm cạnh vào cả hai danh sách kề."
      ],
      pitfalls: [
        "Quên thêm chiều ngược lại với đồ thị vô hướng nên BFS/DFS thiếu đỉnh.",
        "Dùng ma trận kề khi n = 10^5 (cần 10^10 ô) gây tràn bộ nhớ.",
        "Đánh số đỉnh từ 1 nhưng khai báo mảng cỡ n (thiếu một phần tử)."
      ]
    },
    {
      id: "ch6-l3", title: "Tìm kiếm theo chiều sâu (DFS)", minutes: 18,
      sections: [
        {
          heading: "Ý tưởng",
          body: `**DFS** đi sâu hết mức có thể theo một nhánh, hết đường thì **quay lui** (backtrack) rồi thử nhánh khác. Dùng **đệ quy** (hoặc **stack**) và mảng \`visited[]\` để không thăm lại. Thứ tự duyệt phụ thuộc thứ tự các đỉnh kề: thi thường quy ước **đỉnh kề nhỏ hơn thăm trước**.\n\nVới danh sách kề, DFS tốn **O(n + m)**; với ma trận kề tốn **O(n²)**.`,
          code: `vector<int> adj[N];
bool visited[N];

void dfs(int u) {
    visited[u] = true;
    cout << u << " ";                 // "thăm" đỉnh u
    for (int v : adj[u])
        if (!visited[v]) dfs(v);
}`,
          complexity: "O(n + m) với danh sách kề; O(n²) với ma trận kề"
        },
        {
          heading: "Ví dụ và bản dùng stack",
          body: `Đồ thị vô hướng 7 đỉnh, cạnh: 1-2, 1-3, 2-4, 2-5, 3-5, 3-6, 5-7, 6-7. DFS từ 1 (kề nhỏ trước): 1 -> 2 -> 4 (hết đường, quay lại 2) -> 5 -> 3 (kề của 5: 2 đã thăm, 3 chưa) -> 6 -> 7. Thứ tự thăm: **1 2 4 5 3 6 7**.\n\nBản không đệ quy dùng stack: đẩy đỉnh xuất phát; lặp lấy đỉnh trên cùng, nếu chưa thăm thì thăm rồi đẩy các đỉnh kề **theo thứ tự ngược** (để đỉnh nhỏ nằm trên cùng). Dùng khi độ sâu có thể lên tới 10^5–10^6.`,
          code: `void dfsIter(int s) {
    stack<int> st;
    st.push(s);
    while (!st.empty()) {
        int u = st.top(); st.pop();
        if (visited[u]) continue;
        visited[u] = true;
        cout << u << " ";
        for (int i = (int)adj[u].size() - 1; i >= 0; i--)
            if (!visited[adj[u][i]]) st.push(adj[u][i]);
    }
}`
        }
      ],
      keyPoints: [
        "DFS đi sâu rồi quay lui; dùng đệ quy hoặc stack.",
        "Phải có mảng visited để tránh lặp vô hạn trên chu trình.",
        "O(n + m) với danh sách kề, O(n²) với ma trận kề.",
        "Đề thi thường quy ước thăm đỉnh kề nhỏ nhất trước: sắp xếp danh sách kề."
      ],
      pitfalls: [
        "Quên đánh dấu visited trước khi gọi đệ quy dẫn đến lặp vô hạn.",
        "DFS đệ quy trên đồ thị 10^6 đỉnh dạng đường thẳng bị tràn ngăn xếp: dùng stack tự quản lý.",
        "Không sắp xếp danh sách kề nên thứ tự thăm khác đáp án mẫu."
      ]
    },
    {
      id: "ch6-l4", title: "Tìm kiếm theo chiều rộng (BFS)", minutes: 18,
      sections: [
        {
          heading: "Ý tưởng",
          body: `**BFS** thăm các đỉnh theo từng **lớp khoảng cách**: đỉnh xuất phát, rồi các đỉnh cách 1 cạnh, rồi cách 2 cạnh... Dùng **hàng đợi**. Khi đẩy một đỉnh vào queue phải **đánh dấu ngay** để không đẩy trùng.\n\nĐộ phức tạp **O(n + m)** (danh sách kề), **O(n²)** (ma trận kề).`,
          code: `void bfs(int s) {
    queue<int> q;
    q.push(s);
    visited[s] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " ";
        for (int v : adj[u])
            if (!visited[v]) {
                visited[v] = true;      // đánh dấu NGAY khi đẩy vào queue
                q.push(v);
            }
    }
}`,
          complexity: "O(n + m) với danh sách kề"
        },
        {
          heading: "Ví dụ và đường đi ngắn nhất",
          body: `Cùng đồ thị 7 đỉnh ở bài DFS (1-2, 1-3, 2-4, 2-5, 3-5, 3-6, 5-7, 6-7). BFS từ 3 (kề nhỏ trước): queue [3] -> lấy 3, thêm 1, 5, 6 -> lấy 1, thêm 2 -> lấy 5, thêm 7 (2 đã có) -> lấy 6 -> lấy 2, thêm 4 -> lấy 7, lấy 4. Thứ tự: **3 1 5 6 2 7 4**.\n\n**Tính chất quan trọng**: trên đồ thị **không trọng số**, BFS cho **đường đi ngắn nhất** (ít cạnh nhất) từ nguồn tới mọi đỉnh. Lưu thêm mảng \`dist[]\` và \`parent[]\`: khi từ u phát hiện v chưa thăm thì dist[v] = dist[u] + 1, parent[v] = u. Truy ngược parent để in đường đi.`,
          code: `vector<int> dist(n + 1, -1), parent(n + 1, 0);
dist[s] = 0;
queue<int> q; q.push(s);
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u])
        if (dist[v] == -1) {
            dist[v] = dist[u] + 1;
            parent[v] = u;
            q.push(v);
        }
}`
        }
      ],
      keyPoints: [
        "BFS dùng queue, thăm theo từng lớp khoảng cách.",
        "Đánh dấu visited ngay khi đẩy vào queue.",
        "Đồ thị không trọng số: BFS cho đường đi ngắn nhất (theo số cạnh).",
        "O(n + m) với danh sách kề."
      ],
      pitfalls: [
        "Chỉ đánh dấu visited khi lấy khỏi queue nên một đỉnh bị đẩy nhiều lần (chậm, kết quả dist vẫn đúng nhưng dễ sai thứ tự).",
        "Dùng BFS tìm đường ngắn nhất trên đồ thị CÓ trọng số bất kỳ: sai (cần Dijkstra)."
      ]
    },
    {
      id: "ch6-l5", title: "Ứng dụng DFS/BFS: thành phần liên thông, đường đi, đồ thị hai phía", minutes: 15,
      sections: [
        {
          heading: "Đếm thành phần liên thông",
          body: `Duyệt mọi đỉnh u; nếu u chưa thăm thì gọi DFS (hoặc BFS) từ u và tăng bộ đếm. Mỗi lần gọi từ ngoài vào tìm trọn một thành phần liên thông.`,
          code: `int components = 0;
for (int u = 1; u <= n; u++)
    if (!visited[u]) {
        components++;
        dfs(u);
    }`,
          complexity: "O(n + m)"
        },
        {
          heading: "Tìm đường đi từ s tới t",
          body: `Chạy BFS/DFS từ s ghi \`parent[]\`. Nếu t chưa thăm thì không có đường đi; ngược lại truy ngược t -> parent[t] -> ... -> s rồi đảo lại. BFS cho đường ngắn nhất theo số cạnh; DFS cho một đường bất kỳ.`,
          code: `vector<int> path;
for (int v = t; v != 0; v = parent[v]) path.push_back(v);   // parent[s] = 0
reverse(path.begin(), path.end());`
        },
        {
          heading: "Mở rộng: kiểm tra đồ thị hai phía và phát hiện chu trình",
          body: `**Mở rộng.** **Hai phía**: tô màu hai màu bằng BFS – đỉnh kề phải khác màu; gặp cạnh nối hai đỉnh cùng màu thì không phải hai phía (có chu trình lẻ).\n\n**Chu trình trong đồ thị vô hướng**: khi duyệt, gặp đỉnh đã thăm mà **không phải cha** của đỉnh hiện tại thì có chu trình. Đồ thị liên thông có chu trình khi m ≥ n.\n\n**Đồ thị có hướng**: dùng ba trạng thái (chưa thăm / đang thăm / đã xong); gặp cung tới đỉnh 'đang thăm' thì có chu trình.`
        }
      ],
      keyPoints: [
        "Số thành phần liên thông = số lần phải gọi DFS/BFS từ ngoài vào.",
        "Đường đi: lưu parent rồi truy ngược; BFS cho đường ít cạnh nhất.",
        "Hai phía: tô hai màu bằng BFS; xung đột màu nghĩa là không hai phía.",
        "Tất cả O(n + m) với danh sách kề."
      ],
      pitfalls: [
        "Đồ thị không liên thông mà chỉ chạy DFS từ đỉnh 1 rồi kết luận về cả đồ thị.",
        "Quên đặt parent[s] = 0 nên vòng truy ngược đường đi không dừng."
      ]
    },
    {
      id: "ch6-l6", title: "Đồ thị Euler", minutes: 15,
      sections: [
        {
          heading: "Định nghĩa và điều kiện",
          body: `- **Chu trình Euler**: chu trình đi qua **mỗi cạnh đúng một lần** và trở về điểm xuất phát.\n- **Đường đi Euler**: đường đi qua mỗi cạnh đúng một lần (không cần quay về).\n\n**Đồ thị vô hướng** (liên thông, bỏ qua đỉnh cô lập):\n- Có chu trình Euler <=> **mọi đỉnh có bậc chẵn**.\n- Có đường đi Euler (không phải chu trình) <=> có **đúng 2 đỉnh bậc lẻ**; đường đi bắt đầu ở một đỉnh bậc lẻ và kết thúc ở đỉnh bậc lẻ kia.\n\n**Đồ thị có hướng** (liên thông yếu):\n- Có chu trình Euler <=> **với mọi đỉnh, bán bậc vào = bán bậc ra**.\n- Có đường đi Euler <=> mọi đỉnh có bán bậc vào = ra, trừ đúng hai đỉnh: đỉnh xuất phát có ra - vào = 1 và đỉnh kết thúc có vào - ra = 1.\n\nVí dụ: đồ thị 4 đỉnh với cạnh 1-2, 2-3, 3-4, 4-1, 1-3 có bậc 3, 2, 3, 2: đúng hai đỉnh bậc lẻ (1 và 3) nên có đường đi Euler, **không** có chu trình Euler.`
        },
        {
          heading: "Thuật toán tìm chu trình Euler (Hierholzer)",
          body: `Dùng stack: đẩy đỉnh xuất phát. Lặp: lấy đỉnh u trên cùng; nếu u còn cạnh chưa dùng (u, v) thì **xoá cạnh đó** (cả hai chiều với vô hướng) và đẩy v; nếu u hết cạnh thì lấy u ra khỏi stack và ghi vào kết quả. Kết quả (đọc ngược) là chu trình Euler. Để tìm **đường đi** Euler xuất phát từ một đỉnh bậc lẻ. Độ phức tạp O(n + m).`,
          code: `// Đồ thị vô hướng, cạnh đánh số, adj[u] chứa cặp (v, id cạnh)
vector<pair<int,int>> adj[N];
bool used[M];
vector<int> euler(int s) {
    vector<int> st = {s}, res;
    vector<int> ptr(n + 1, 0);
    while (!st.empty()) {
        int u = st.back();
        while (ptr[u] < (int)adj[u].size() && used[adj[u][ptr[u]].second]) ptr[u]++;
        if (ptr[u] == (int)adj[u].size()) {
            res.push_back(u);
            st.pop_back();
        } else {
            auto [v, id] = adj[u][ptr[u]];
            used[id] = true;
            st.push_back(v);
        }
    }
    reverse(res.begin(), res.end());
    return res;                               // dãy đỉnh của chu trình/đường đi Euler
}`,
          complexity: "O(n + m)"
        }
      ],
      keyPoints: [
        "Vô hướng: chu trình Euler <=> liên thông và mọi bậc chẵn.",
        "Vô hướng: đường đi Euler (không chu trình) <=> đúng 2 đỉnh bậc lẻ.",
        "Có hướng: chu trình Euler <=> vào = ra tại mọi đỉnh.",
        "Hierholzer dùng stack, O(n + m)."
      ],
      pitfalls: [
        "Chỉ kiểm tra bậc mà quên điều kiện liên thông (các cạnh phải nằm trong một thành phần liên thông).",
        "Nhầm Euler (qua mỗi CẠNH một lần) với Hamilton (qua mỗi ĐỈNH một lần; không có điều kiện đơn giản)."
      ]
    },
    {
      id: "ch6-l7", title: "Cây khung: DFS/BFS, Kruskal và Prim", minutes: 25,
      sections: [
        {
          heading: "Cây khung",
          body: `**Cây khung** của đồ thị vô hướng liên thông G (n đỉnh) là đồ thị con chứa **mọi đỉnh**, liên thông và không có chu trình, tức có đúng **n - 1 cạnh**. Chỉ tồn tại khi G liên thông.\n\n**Cây khung bằng DFS/BFS**: chạy DFS (hoặc BFS) từ một đỉnh; mỗi cạnh dùng để phát hiện đỉnh mới (u, v) được đưa vào cây khung. Độ phức tạp O(n + m). Cây khung BFS còn có tính chất: đường đi từ gốc tới mỗi đỉnh trong cây là đường ngắn nhất (theo số cạnh).\n\n**Cây khung nhỏ nhất (MST)** của đồ thị có trọng số: cây khung có tổng trọng số nhỏ nhất. Hai thuật toán tham lam: Kruskal và Prim.`
        },
        {
          heading: "Thuật toán Kruskal",
          body: `Ý tưởng: sắp xếp cạnh **tăng dần** theo trọng số; lần lượt xét từng cạnh, **thêm vào cây nếu không tạo chu trình** (hai đầu mút thuộc hai thành phần khác nhau); dừng khi đủ n - 1 cạnh. Kiểm tra chu trình bằng cấu trúc **Disjoint Set Union (DSU)** – hai thao tác find và union.`,
          code: `int par[N];
int find(int x) { return par[x] == x ? x : par[x] = find(par[x]); }   // nén đường đi

long long kruskal(int n, vector<Edge> &edges) {
    sort(edges.begin(), edges.end(), [](const Edge &a, const Edge &b) { return a.w < b.w; });
    for (int i = 1; i <= n; i++) par[i] = i;
    long long total = 0;
    int cnt = 0;
    for (const Edge &e : edges) {
        int a = find(e.u), b = find(e.v);
        if (a != b) {                 // khác thành phần -> không tạo chu trình
            par[a] = b;
            total += e.w;
            if (++cnt == n - 1) break;
        }
    }
    return total;
}`,
          complexity: "O(m log m) do sắp xếp cạnh (DSU gần như O(1) mỗi thao tác)"
        },
        {
          heading: "Thuật toán Prim",
          body: `Ý tưởng: bắt đầu từ một đỉnh, mỗi bước chọn **cạnh nhẹ nhất nối tập đỉnh đã chọn với đỉnh chưa chọn** rồi thêm đỉnh đó vào. Dùng hàng đợi ưu tiên (min-heap) chứa các cạnh biên.`,
          code: `long long prim(int s, int n, vector<pair<int,int>> adj[]) {   // adj[u] = (v, w)
    vector<bool> inTree(n + 1, false);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    pq.push({0, s});
    long long total = 0;
    while (!pq.empty()) {
        auto [w, u] = pq.top(); pq.pop();
        if (inTree[u]) continue;
        inTree[u] = true;
        total += w;
        for (auto [v, c] : adj[u])
            if (!inTree[v]) pq.push({c, v});
    }
    return total;
}`,
          complexity: "O(m log n) với heap; O(n²) với mảng (hợp với ma trận kề, đồ thị dày)"
        },
        {
          heading: "Ví dụ chạy tay",
          body: `Đồ thị 6 đỉnh, các cạnh (trọng số): 1-2 (7), 1-3 (9), 1-6 (14), 2-3 (10), 2-4 (15), 3-4 (11), 3-6 (2), 4-5 (6), 5-6 (9).\n\n**Kruskal**: sắp xếp: 3-6 (2), 4-5 (6), 1-2 (7), 1-3 (9), 5-6 (9), 2-3 (10), 3-4 (11), ... Nhận 3-6, 4-5, 1-2, 1-3, 5-6 (nối được hai nhóm {1,2,3,6} và {4,5}); đủ 5 cạnh, bỏ qua phần còn lại. Tổng = 2 + 6 + 7 + 9 + 9 = **33**.\n\n**Prim từ đỉnh 1**: chọn 1-2 (7), rồi 1-3 (9), rồi 3-6 (2), rồi 6-5 (9), rồi 5-4 (6). Tổng = **33**.\n\nHai thuật toán cho cùng tổng trọng số (cây khung có thể khác nhau nếu có nhiều cạnh trọng số bằng nhau).`
        }
      ],
      keyPoints: [
        "Cây khung có đúng n - 1 cạnh và chỉ tồn tại khi đồ thị liên thông.",
        "Kruskal: sắp xếp cạnh tăng dần, nhận cạnh không tạo chu trình (dùng DSU), O(m log m).",
        "Prim: mở rộng cây từ một đỉnh, luôn chọn cạnh nhẹ nhất ra khỏi cây, O(m log n).",
        "Kruskal hợp với danh sách cạnh (đồ thị thưa); Prim hợp với đồ thị dày."
      ],
      pitfalls: [
        "Kruskal quên kiểm tra chu trình (chỉ chọn cạnh nhỏ nhất liên tục).",
        "Đồ thị không liên thông: sau Kruskal số cạnh nhận được < n - 1, phải báo không có cây khung.",
        "Dùng int cho tổng trọng số khi có thể vượt 2·10^9."
      ]
    },
    {
      id: "ch6-l8", title: "Đường đi ngắn nhất: Dijkstra", minutes: 22,
      sections: [
        {
          heading: "Bài toán và điều kiện",
          body: `Cho đồ thị có trọng số, tìm đường đi **ngắn nhất** (tổng trọng số nhỏ nhất) từ đỉnh nguồn s tới các đỉnh khác. **Dijkstra** giải bài toán với điều kiện **mọi trọng số không âm**. Nếu có cạnh âm, phải dùng Bellman-Ford.`
        },
        {
          heading: "Thuật toán",
          body: `Duy trì mảng \`d[v]\` = độ dài đường đi ngắn nhất tạm thời từ s tới v (khởi tạo d[s] = 0, còn lại ∞) và tập đỉnh đã chốt. Lặp:\n\n1. Chọn đỉnh u **chưa chốt có d[u] nhỏ nhất** và chốt nó (d[u] đã là kết quả cuối).\n2. **Nới lỏng (relax)** mọi cạnh (u, v, w): nếu d[u] + w < d[v] thì d[v] = d[u] + w, parent[v] = u.\n\nDùng hàng đợi ưu tiên (min-heap) để chọn nhanh đỉnh nhỏ nhất. Khi lấy cặp (dist, u) ra mà dist > d[u] thì là bản cũ, bỏ qua.`,
          code: `const long long INF = 1e18;
vector<pair<int,int>> adj[N];       // (v, w)
long long d[N];
int parent[N];

void dijkstra(int s, int n) {
    fill(d, d + n + 1, INF);
    fill(parent, parent + n + 1, 0);
    priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> pq;
    d[s] = 0;
    pq.push({0, s});
    while (!pq.empty()) {
        auto [du, u] = pq.top(); pq.pop();
        if (du > d[u]) continue;           // bản cũ
        for (auto [v, w] : adj[u])
            if (d[u] + w < d[v]) {
                d[v] = d[u] + w;
                parent[v] = u;
                pq.push({d[v], v});
            }
    }
}`,
          complexity: "O((n + m) log n) với heap; O(n²) với mảng + ma trận kề"
        },
        {
          heading: "Ví dụ chạy tay",
          body: `Dùng đồ thị 6 đỉnh ở bài Kruskal (vô hướng), nguồn 1.\n\n- Bắt đầu: d1 = 0. Chốt 1: d2 = 7, d3 = 9, d6 = 14.\n- Chốt 2 (7): thử 2-3: 17 > 9 (không đổi); 2-4: d4 = 22.\n- Chốt 3 (9): d4 = min(22, 9+11) = 20; d6 = min(14, 9+2) = 11.\n- Chốt 6 (11): d5 = 11 + 9 = 20.\n- Chốt 4, 5 (cùng 20): không cải thiện thêm.\n\nKết quả d = [0, 7, 9, 20, 20, 11]. Đường tới 5: 1 -> 3 -> 6 -> 5 (độ dài 20). Dijkstra **đúng** vì khi chốt một đỉnh, mọi đường qua đỉnh chưa chốt đều không ngắn hơn (do trọng số không âm).`
        }
      ],
      keyPoints: [
        "Dijkstra chỉ đúng khi mọi trọng số ≥ 0.",
        "Mỗi bước chốt đỉnh chưa chốt có d nhỏ nhất, rồi relax các cạnh kề.",
        "Dùng priority_queue (min-heap): O((n + m) log n); không heap: O(n²).",
        "Lưu parent[] để in đường đi."
      ],
      pitfalls: [
        "Dùng priority_queue mặc định (max-heap) mà quên greater<> nên lấy sai đỉnh.",
        "Quên bỏ qua bản cũ (du > d[u]) làm chậm hoặc dùng sai.",
        "Dùng int cho INF và cộng d[u] + w gây tràn số; dùng long long.",
        "Áp dụng cho đồ thị có cạnh âm."
      ]
    },
    {
      id: "ch6-l9", title: "Đường đi ngắn nhất: Bellman-Ford và Floyd-Warshall", minutes: 20,
      sections: [
        {
          heading: "Bellman-Ford",
          body: `Xử lý được **cạnh có trọng số âm** và phát hiện được **chu trình âm** (chu trình có tổng trọng số âm; khi đó đường ngắn nhất không xác định). Ý tưởng: lặp **n - 1 lần**, mỗi lần relax **tất cả** các cạnh. Nếu sang lần thứ n vẫn còn relax được thì có chu trình âm từ nguồn tới được. Đồ thị vô hướng có cạnh âm luôn có chu trình âm, nên Bellman-Ford dùng cho đồ thị **có hướng**.`,
          code: `// edges: danh sách cung có hướng (u, v, w)
bool bellmanFord(int s, int n, vector<Edge> &edges, vector<long long> &d) {
    d.assign(n + 1, INF);
    d[s] = 0;
    for (int i = 1; i <= n - 1; i++) {
        bool changed = false;
        for (const Edge &e : edges)
            if (d[e.u] != INF && d[e.u] + e.w < d[e.v]) {
                d[e.v] = d[e.u] + e.w;
                changed = true;
            }
        if (!changed) break;                // dừng sớm
    }
    for (const Edge &e : edges)
        if (d[e.u] != INF && d[e.u] + e.w < d[e.v]) return false;   // có chu trình âm
    return true;
}`,
          complexity: "O(n·m)"
        },
        {
          heading: "Floyd-Warshall",
          body: `Tìm đường ngắn nhất giữa **mọi cặp đỉnh**. Dùng ma trận d[i][j]; xét lần lượt từng đỉnh trung gian k: thử đi i -> k -> j. **Vòng lặp k phải ở ngoài cùng.**`,
          code: `// d[i][j] = trọng số cạnh (i, j), INF nếu không có, d[i][i] = 0
for (int k = 1; k <= n; k++)
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            if (d[i][k] < INF && d[k][j] < INF && d[i][k] + d[k][j] < d[i][j])
                d[i][j] = d[i][k] + d[k][j];`,
          complexity: "O(n³) thời gian, O(n²) bộ nhớ"
        },
        {
          heading: "Chọn thuật toán nào?",
          body: `- Một nguồn, trọng số không âm: **Dijkstra** (nhanh nhất).\n- Một nguồn, có trọng số âm / cần phát hiện chu trình âm: **Bellman-Ford**.\n- Mọi cặp đỉnh, n nhỏ (≤ 400–500): **Floyd-Warshall**.\n- Không trọng số: **BFS**.\n\nVí dụ Bellman-Ford: cung 1->2 (4), 1->3 (5), 2->3 (-3), 3->4 (2), 2->4 (6). Từ 1: d2 = 4, d3 = min(5, 4 - 3) = 1, d4 = min(6, 1 + 2) = 3.`
        }
      ],
      keyPoints: [
        "Bellman-Ford: n - 1 lần relax mọi cạnh, O(n·m); lần thứ n còn relax được -> chu trình âm.",
        "Floyd-Warshall: ba vòng lặp lồng nhau với k ngoài cùng, O(n³), cho mọi cặp đỉnh.",
        "Dijkstra không dùng với cạnh âm.",
        "Không trọng số thì dùng BFS."
      ],
      pitfalls: [
        "Floyd: đặt k ở vòng trong cùng thì kết quả sai.",
        "Cộng INF với số âm làm d[u] + w nhỏ hơn INF giả: luôn kiểm tra d[u] != INF trước khi relax.",
        "Khởi tạo d[i][i] khác 0 trong Floyd."
      ]
    }
  ],
  flashcards: [
    { front: "Định lý bắt tay cho đồ thị vô hướng?", back: "Tổng bậc mọi đỉnh = 2 × số cạnh; số đỉnh bậc lẻ luôn chẵn." },
    { front: "Cây có n đỉnh có bao nhiêu cạnh? Cây khung?", back: "n - 1 cạnh. Cây khung của đồ thị liên thông n đỉnh cũng có đúng n - 1 cạnh." },
    { front: "So sánh ma trận kề và danh sách kề (bộ nhớ, kiểm tra cạnh)?", back: "Ma trận kề: O(n²), kiểm tra cạnh O(1). Danh sách kề: O(n + m), duyệt kề O(deg). Danh sách kề tốt cho đồ thị thưa." },
    { front: "Ma trận kề của đồ thị vô hướng có tính chất gì?", back: "Đối xứng qua đường chéo chính; tổng hàng i bằng bậc của đỉnh i." },
    { front: "Danh sách cạnh dùng khi nào?", back: "Kruskal (sắp xếp cạnh) và Bellman-Ford (duyệt mọi cạnh); bộ nhớ O(m)." },
    { front: "DFS dùng cấu trúc gì? Độ phức tạp?", back: "Đệ quy / ngăn xếp. O(n + m) với danh sách kề, O(n²) với ma trận kề." },
    { front: "BFS dùng cấu trúc gì? Tính chất nổi bật?", back: "Hàng đợi. Thăm theo lớp khoảng cách; cho đường đi ngắn nhất (ít cạnh nhất) trên đồ thị không trọng số." },
    { front: "Vì sao đánh dấu visited ngay khi đẩy vào queue (BFS)?", back: "Để một đỉnh không bị đẩy vào queue nhiều lần." },
    { front: "Đếm số thành phần liên thông bằng cách nào?", back: "Duyệt mọi đỉnh; mỗi lần gặp đỉnh chưa thăm thì gọi DFS/BFS và tăng bộ đếm." },
    { front: "Điều kiện có chu trình Euler trong đồ thị vô hướng?", back: "Liên thông và mọi đỉnh có bậc chẵn." },
    { front: "Điều kiện có đường đi Euler (không chu trình) trong đồ thị vô hướng?", back: "Liên thông và có đúng 2 đỉnh bậc lẻ (đường đi bắt đầu/kết thúc ở hai đỉnh đó)." },
    { front: "Điều kiện chu trình Euler trong đồ thị có hướng?", back: "Với mọi đỉnh, bán bậc vào = bán bậc ra (và đồ thị liên thông yếu)." },
    { front: "Kruskal hoạt động thế nào? Độ phức tạp?", back: "Sắp xếp cạnh tăng dần, thêm cạnh nếu không tạo chu trình (kiểm tra bằng DSU). O(m log m)." },
    { front: "Prim hoạt động thế nào?", back: "Từ một đỉnh, mỗi bước chọn cạnh nhẹ nhất nối cây hiện tại với đỉnh ngoài cây. O(m log n) với heap." },
    { front: "Dijkstra: điều kiện và độ phức tạp?", back: "Trọng số không âm. O((n + m) log n) với priority_queue, O(n²) với mảng." },
    { front: "Relax cạnh (u, v, w) nghĩa là gì?", back: "Nếu d[u] + w < d[v] thì d[v] = d[u] + w (và parent[v] = u)." },
    { front: "Bellman-Ford: khi nào dùng, phát hiện chu trình âm thế nào?", back: "Có cạnh âm. Relax mọi cạnh n-1 lần; lần thứ n còn relax được thì có chu trình âm. O(n·m)." },
    { front: "Floyd-Warshall: độ phức tạp và thứ tự vòng lặp?", back: "O(n³); k (đỉnh trung gian) phải ở vòng ngoài cùng, rồi i, j." }
  ],
  quiz: [
    {
      id: "ch6-q1",
      question: "Đồ thị vô hướng đơn có 6 đỉnh và 10 cạnh. Tổng bậc của tất cả các đỉnh là?",
      options: ["10", "20", "16", "60"], answer: 1,
      explanation: "Mỗi cạnh đóng góp 2 vào tổng bậc (mỗi đầu mút một lần): 2 × 10 = 20."
    },
    {
      id: "ch6-q2",
      question: "Với đồ thị vô hướng, ma trận kề có tính chất nào sau đây?",
      options: ["Đối xứng qua đường chéo chính", "Tất cả phần tử tam giác trên bằng 0", "Mọi phần tử trên đường chéo bằng 1", "Tổng mọi hàng đều bằng nhau"], answer: 0,
      explanation: "Cạnh (i, j) cũng là cạnh (j, i) nên A[i][j] = A[j][i]. Đường chéo bằng 0 với đồ thị không có khuyên; tổng hàng là bậc của từng đỉnh nên nói chung khác nhau."
    },
    {
      id: "ch6-q3",
      question: "Đồ thị thưa có n = 10^5 đỉnh và m = 2·10^5 cạnh. Biểu diễn nào phù hợp nhất?",
      options: ["Ma trận kề, bộ nhớ O(n²)", "Chỉ một cây nhị phân", "Danh sách kề, bộ nhớ O(n + m)", "Ma trận trọng số cấp n"], answer: 2,
      explanation: "Ma trận kề cần n² = 10^10 ô, quá lớn. Danh sách kề chỉ cần O(n + m) và duyệt kề nhanh."
    },
    {
      id: "ch6-q4",
      question: "Đồ thị vô hướng 7 đỉnh, cạnh: 1-2, 1-3, 2-4, 2-5, 3-5, 3-6, 5-7, 6-7. Duyệt BFS từ đỉnh 3 (ưu tiên đỉnh kề nhỏ hơn) cho thứ tự thăm là?",
      options: ["3 1 2 4 5 7 6", "3 1 5 6 2 7 4", "3 1 2 5 6 4 7", "3 5 6 1 7 2 4"], answer: 1,
      explanation: "Queue [3]. Lấy 3: thêm 1, 5, 6. Lấy 1: thêm 2. Lấy 5: 7 (2 đã có). Lấy 6, lấy 2: thêm 4. Lấy 7, 4. Thứ tự: 3 1 5 6 2 7 4. Đáp án 1 là kết quả DFS từ 3."
    },
    {
      id: "ch6-q5",
      question: "Với đồ thị trong câu trước, duyệt DFS từ đỉnh 1 (ưu tiên đỉnh kề nhỏ hơn) cho thứ tự thăm là?",
      options: ["1 2 3 4 5 6 7", "1 2 5 3 6 7 4", "1 2 4 5 3 6 7", "1 3 6 7 5 2 4"], answer: 2,
      explanation: "1 -> 2 -> 4 (hết đường, quay lại 2) -> 5 -> 3 -> 6 -> 7. Thứ tự: 1 2 4 5 3 6 7. Đáp án 1 là BFS; đáp án 4 sẽ đúng nếu ưu tiên đỉnh kề lớn hơn nhưng không khớp quy ước."
    },
    {
      id: "ch6-q6",
      question: "Đồ thị vô hướng có 9 đỉnh với các cạnh: 1-2, 2-3, 4-5, 6-7, 7-8, 8-6. Số thành phần liên thông là?",
      options: ["2", "3", "5", "4"], answer: 3,
      explanation: "Các thành phần: {1,2,3}, {4,5}, {6,7,8} và đỉnh cô lập {9}. Tổng cộng 4."
    },
    {
      id: "ch6-q7",
      question: "Trong đồ thị 7 đỉnh của câu 4, đường đi ngắn nhất (ít cạnh nhất) từ đỉnh 1 tới đỉnh 7 có bao nhiêu cạnh?",
      options: ["2", "3", "4", "5"], answer: 1,
      explanation: "Ví dụ 1-2-5-7, 1-3-5-7 hoặc 1-3-6-7 đều có 3 cạnh. Không có đường 2 cạnh vì 1 và 7 không có đỉnh kề chung (kề của 1: {2,3}, kề của 7: {5,6})."
    },
    {
      id: "ch6-q8",
      question: "Thuật toán BFS sử dụng cấu trúc dữ liệu nào để lưu các đỉnh chờ xử lý?",
      options: ["Hàng đợi", "Ngăn xếp", "Heap", "Cây AVL"], answer: 0,
      explanation: "BFS cần xử lý đỉnh phát hiện trước thì thăm trước (FIFO) nên dùng hàng đợi. Ngăn xếp (hoặc đệ quy) là của DFS."
    },
    {
      id: "ch6-q9",
      question: "Điều kiện cần và đủ để đồ thị vô hướng liên thông có chu trình Euler là?",
      options: ["Có đúng 2 đỉnh bậc lẻ", "Mọi đỉnh đều có bậc lẻ", "Mọi đỉnh đều có bậc chẵn", "Số cạnh bằng số đỉnh"], answer: 2,
      explanation: "Mỗi lần đi qua một đỉnh dùng một cạnh vào và một cạnh ra nên mọi đỉnh phải có bậc chẵn. Có đúng 2 đỉnh bậc lẻ là điều kiện của đường đi Euler (không khép kín)."
    },
    {
      id: "ch6-q10",
      question: "Đồ thị vô hướng 4 đỉnh có các cạnh: 1-2, 2-3, 3-4, 4-1, 1-3. Phát biểu nào đúng?",
      options: ["Có chu trình Euler", "Có đường đi Euler nhưng không có chu trình Euler", "Không có đường đi Euler", "Có chu trình Euler vì đồ thị liên thông"], answer: 1,
      explanation: "Bậc: deg1 = 3, deg2 = 2, deg3 = 3, deg4 = 2. Có đúng hai đỉnh bậc lẻ (1 và 3) nên có đường đi Euler (đi từ 1 tới 3) nhưng không có chu trình Euler."
    },
    {
      id: "ch6-q11",
      question: "Một cây khung của đồ thị liên thông có 10 đỉnh có bao nhiêu cạnh?",
      options: ["10", "8", "9", "11"], answer: 2,
      explanation: "Cây khung là cây trên toàn bộ n đỉnh nên có n - 1 = 9 cạnh."
    },
    {
      id: "ch6-q12",
      question: "Đồ thị vô hướng 6 đỉnh, cạnh (trọng số): 1-2 (7), 1-3 (9), 1-6 (14), 2-3 (10), 2-4 (15), 3-4 (11), 3-6 (2), 4-5 (6), 5-6 (9). Tổng trọng số cây khung nhỏ nhất là?",
      options: ["35", "37", "31", "33"], answer: 3,
      explanation: "Kruskal: nhận 3-6 (2), 4-5 (6), 1-2 (7), 1-3 (9), 5-6 (9) thì đủ 5 cạnh: 2 + 6 + 7 + 9 + 9 = 33. Cạnh 2-3 (10) bị loại vì tạo chu trình 1-2-3."
    },
    {
      id: "ch6-q13",
      question: "Với đồ thị của câu 12, chạy thuật toán Prim xuất phát từ đỉnh 1. Cạnh thứ ba được chọn vào cây là?",
      options: ["Cạnh (1,3) trọng số 9", "Cạnh (3,6) trọng số 2", "Cạnh (5,6) trọng số 9", "Cạnh (4,5) trọng số 6"], answer: 1,
      explanation: "Cạnh 1: (1,2) trọng số 7 (nhỏ nhất trong 7, 9, 14). Cạnh 2: (1,3) trọng số 9 (nhỏ nhất trong 9, 14, 10, 15). Cạnh 3: trong số các cạnh biên, (3,6) trọng số 2 là nhỏ nhất. Cạnh (4,5) chưa nối được với cây ở thời điểm này."
    },
    {
      id: "ch6-q14",
      question: "Với đồ thị của câu 12, chạy thuật toán Dijkstra từ đỉnh 1. Khoảng cách ngắn nhất từ 1 tới 5 là?",
      options: ["18", "23", "26", "20"], answer: 3,
      explanation: "Đường 1-3-6-5 có độ dài 9 + 2 + 9 = 20. Các đường khác: 1-6-5 = 23, 1-3-4-5 = 26."
    },
    {
      id: "ch6-q15",
      question: "Đồ thị có hướng có cung trọng số âm (nhưng không có chu trình âm). Thuật toán nào dùng để tìm đường đi ngắn nhất từ một đỉnh?",
      options: ["Dijkstra", "Kruskal", "Bellman-Ford", "Prim"], answer: 2,
      explanation: "Dijkstra giả định trọng số không âm nên có thể sai; Bellman-Ford xử lý được trọng số âm. Kruskal và Prim tìm cây khung nhỏ nhất, không phải đường đi."
    },
    {
      id: "ch6-q16",
      question: "Độ phức tạp thời gian của thuật toán Floyd-Warshall trên đồ thị n đỉnh là?",
      options: ["O(n + m)", "O(n·m)", "O(n²)", "O(n³)"], answer: 3,
      explanation: "Ba vòng lặp lồng nhau k, i, j đều chạy từ 1 tới n nên O(n³). O(n·m) là của Bellman-Ford."
    },
    {
      id: "ch6-q17",
      question: "Độ phức tạp thời gian của thuật toán Bellman-Ford (n đỉnh, m cạnh) là?",
      options: ["O(n·m)", "O(m log n)", "O(n³)", "O(n²)"], answer: 0,
      explanation: "Lặp n - 1 lần, mỗi lần relax m cạnh: O(n·m)."
    },
    {
      id: "ch6-q18",
      question: "Thuật toán Kruskal dùng cấu trúc dữ liệu nào để kiểm tra việc thêm một cạnh có tạo chu trình hay không?",
      options: ["Disjoint Set Union (tập rời nhau)", "Hàng đợi", "Ma trận kề", "Ngăn xếp"], answer: 0,
      explanation: "DSU cho biết hai đỉnh có cùng thành phần liên thông hay chưa (find) và hợp hai thành phần (union). Cạnh nối hai đỉnh cùng thành phần sẽ tạo chu trình."
    }
  ],
  exercises: [
    {
      id: "ch6-e1", title: "Từ ma trận kề sang danh sách kề", difficulty: "Dễ",
      statement: `Cho đồ thị vô hướng n đỉnh dưới dạng ma trận kề. In danh sách kề: dòng thứ i gồm \`i:\` rồi các đỉnh kề của i theo thứ tự tăng dần.\n\n**Input**: dòng đầu n (1 ≤ n ≤ 1000), tiếp theo n dòng, mỗi dòng n số 0/1.\n\n**Output**: n dòng.\n\n**Ví dụ**\n\nInput:\n4\n0 1 1 0\n1 0 0 1\n1 0 0 1\n0 1 1 0\n\nOutput:\n1: 2 3\n2: 1 4\n3: 1 4\n4: 2 3`,
      hint: "Duyệt từng hàng i, cột j tăng dần, nếu a[i][j] = 1 thì in j. Chú ý định dạng 'i:' rồi từng số kèm khoảng trắng phía trước.",
      solution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<vector<int>> a(n + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            cin >> a[i][j];
    for (int i = 1; i <= n; i++) {
        cout << i << ":";
        for (int j = 1; j <= n; j++)
            if (a[i][j]) cout << " " << j;
        cout << endl;
    }
    return 0;
}`,
      complexity: "O(n²)"
    },
    {
      id: "ch6-e2", title: "Duyệt BFS", difficulty: "Dễ",
      statement: `Cho đồ thị vô hướng n đỉnh (đánh số 1..n), m cạnh và đỉnh s. In thứ tự các đỉnh được thăm khi duyệt BFS từ s, ưu tiên đỉnh kề có số nhỏ hơn. Chỉ in các đỉnh tới được từ s.\n\n**Input**: dòng đầu n, m, s; m dòng sau mỗi dòng hai số u v.\n\n**Output**: dãy đỉnh theo thứ tự BFS, cách nhau khoảng trắng.\n\n**Ví dụ**\n\nInput:\n7 8 3\n1 2\n1 3\n2 4\n2 5\n3 5\n3 6\n5 7\n6 7\n\nOutput:\n3 1 5 6 2 7 4`,
      hint: "Danh sách kề, sắp xếp từng danh sách tăng dần. Dùng queue, đánh dấu visited ngay khi đẩy vào.",
      solution: `#include <algorithm>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    int n, m, s;
    cin >> n >> m >> s;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    for (int u = 1; u <= n; u++) sort(adj[u].begin(), adj[u].end());
    vector<bool> visited(n + 1, false);
    queue<int> q;
    q.push(s);
    visited[s] = true;
    bool first = true;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        if (!first) cout << " ";
        cout << u;
        first = false;
        for (int v : adj[u])
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
    }
    cout << endl;
    return 0;
}`,
      complexity: "O(n + m log m)"
    },
    {
      id: "ch6-e3", title: "Duyệt DFS", difficulty: "Dễ",
      statement: `Cùng định dạng với bài BFS: cho đồ thị vô hướng n đỉnh, m cạnh và đỉnh s. In thứ tự các đỉnh được thăm khi duyệt **DFS** từ s, ưu tiên đỉnh kề có số nhỏ hơn.\n\n**Input**: dòng đầu n, m, s; m dòng sau mỗi dòng hai số u v.\n\n**Output**: dãy đỉnh theo thứ tự DFS, cách nhau khoảng trắng.\n\n**Ví dụ**\n\nInput:\n7 8 1\n1 2\n1 3\n2 4\n2 5\n3 5\n3 6\n5 7\n6 7\n\nOutput:\n1 2 4 5 3 6 7`,
      hint: "Hàm dfs(u) đệ quy: đánh dấu u, in u, rồi gọi dfs(v) cho mọi đỉnh kề v chưa thăm (danh sách kề đã sắp xếp tăng dần).",
      solution: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> adj;
vector<bool> visited;
bool first = true;

void dfs(int u) {
    visited[u] = true;
    if (!first) cout << " ";
    cout << u;
    first = false;
    for (int v : adj[u])
        if (!visited[v]) dfs(v);
}

int main() {
    int n, m, s;
    cin >> n >> m >> s;
    adj.assign(n + 1, {});
    visited.assign(n + 1, false);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    for (int u = 1; u <= n; u++) sort(adj[u].begin(), adj[u].end());
    dfs(s);
    cout << endl;
    return 0;
}`,
      complexity: "O(n + m log m)"
    },
    {
      id: "ch6-e4", title: "Đếm thành phần liên thông", difficulty: "Vừa",
      statement: `Cho đồ thị vô hướng n đỉnh, m cạnh. Đếm số thành phần liên thông.\n\n**Input**: dòng đầu n, m (1 ≤ n ≤ 10^5, 0 ≤ m ≤ 2·10^5); m dòng sau mỗi dòng hai số u v.\n\n**Output**: một số nguyên.\n\n**Ví dụ**\n\nInput:\n9 6\n1 2\n2 3\n4 5\n6 7\n7 8\n8 6\n\nOutput:\n4`,
      hint: "Với mỗi đỉnh chưa thăm: tăng bộ đếm và chạy BFS/DFS. Dùng BFS (hoặc DFS với stack) để tránh tràn ngăn xếp khi n lớn.",
      solution: `#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    vector<bool> visited(n + 1, false);
    int components = 0;
    for (int s = 1; s <= n; s++) {
        if (visited[s]) continue;
        components++;
        queue<int> q;
        q.push(s);
        visited[s] = true;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u])
                if (!visited[v]) {
                    visited[v] = true;
                    q.push(v);
                }
        }
    }
    cout << components << endl;
    return 0;
}`,
      complexity: "O(n + m)"
    },
    {
      id: "ch6-e5", title: "Đường đi ngắn nhất theo số cạnh", difficulty: "Vừa",
      statement: `Cho đồ thị vô hướng n đỉnh, m cạnh và hai đỉnh s, t. In độ dài (số cạnh) đường đi ngắn nhất từ s tới t và đường đi đó. Nếu có nhiều đường, in đường nhận được khi BFS từ s duyệt đỉnh kề theo thứ tự tăng dần (lưu đỉnh cha khi phát hiện lần đầu). Nếu không có đường đi in \`-1\`.\n\n**Input**: dòng đầu n, m, s, t; m dòng sau mỗi dòng u v.\n\n**Output**: dòng 1: số cạnh; dòng 2: các đỉnh trên đường đi từ s tới t. Nếu không có đường chỉ in \`-1\`.\n\n**Ví dụ**\n\nInput:\n7 8 1 7\n1 2\n1 3\n2 4\n2 5\n3 5\n3 6\n5 7\n6 7\n\nOutput:\n3\n1 2 5 7`,
      hint: "BFS với dist[] và parent[]; dist = -1 nghĩa là chưa thăm. Truy ngược từ t theo parent rồi đảo mảng.",
      solution: `#include <algorithm>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    int n, m, s, t;
    cin >> n >> m >> s >> t;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    for (int u = 1; u <= n; u++) sort(adj[u].begin(), adj[u].end());
    vector<int> dist(n + 1, -1), parent(n + 1, 0);
    queue<int> q;
    q.push(s);
    dist[s] = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u])
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                parent[v] = u;
                q.push(v);
            }
    }
    if (dist[t] == -1) {
        cout << -1 << endl;
        return 0;
    }
    vector<int> path;
    for (int v = t; v != 0; v = parent[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    cout << dist[t] << endl;
    for (size_t i = 0; i < path.size(); i++) cout << path[i] << (i + 1 < path.size() ? " " : "\\n");
    return 0;
}`,
      complexity: "O(n + m log m)"
    },
    {
      id: "ch6-e6", title: "Cây khung nhỏ nhất (Kruskal)", difficulty: "Vừa",
      statement: `Cho đồ thị vô hướng liên thông có trọng số gồm n đỉnh, m cạnh. In tổng trọng số của cây khung nhỏ nhất.\n\n**Input**: dòng đầu n, m (n ≤ 10^5, m ≤ 3·10^5); m dòng sau mỗi dòng u v w (1 ≤ w ≤ 10^9).\n\n**Output**: tổng trọng số.\n\n**Ví dụ**\n\nInput:\n6 9\n1 2 7\n1 3 9\n1 6 14\n2 3 10\n2 4 15\n3 4 11\n3 6 2\n4 5 6\n5 6 9\n\nOutput:\n33`,
      hint: "Sắp xếp cạnh theo trọng số tăng dần; dùng DSU (find có nén đường đi) để bỏ qua cạnh nối hai đỉnh cùng thành phần. Dùng long long cho tổng.",
      solution: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

struct Edge {
    int u, v;
    long long w;
};

vector<int> par;

int find(int x) {
    return par[x] == x ? x : par[x] = find(par[x]);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n, m;
    cin >> n >> m;
    vector<Edge> edges(m);
    for (auto &e : edges) cin >> e.u >> e.v >> e.w;
    sort(edges.begin(), edges.end(), [](const Edge &a, const Edge &b) { return a.w < b.w; });
    par.resize(n + 1);
    for (int i = 1; i <= n; i++) par[i] = i;
    long long total = 0;
    int cnt = 0;
    for (const Edge &e : edges) {
        int a = find(e.u), b = find(e.v);
        if (a != b) {
            par[a] = b;
            total += e.w;
            if (++cnt == n - 1) break;
        }
    }
    cout << total << endl;
    return 0;
}`,
      complexity: "O(m log m)"
    },
    {
      id: "ch6-e7", title: "Dijkstra có in đường đi", difficulty: "Khó",
      statement: `Cho đồ thị vô hướng có trọng số dương gồm n đỉnh, m cạnh, và hai đỉnh s, t. In độ dài đường đi ngắn nhất từ s tới t và một đường đi đó (các đỉnh từ s tới t). Nếu không tới được in \`-1\`.\n\n**Input**: dòng đầu n, m, s, t (n ≤ 10^5, m ≤ 2·10^5); m dòng sau mỗi dòng u v w (1 ≤ w ≤ 10^9).\n\n**Output**: dòng 1: độ dài; dòng 2: đường đi. Nếu không tới được chỉ in \`-1\`.\n\n**Ví dụ**\n\nInput:\n6 9 1 5\n1 2 7\n1 3 9\n1 6 14\n2 3 10\n2 4 15\n3 4 11\n3 6 2\n4 5 6\n5 6 9\n\nOutput:\n20\n1 3 6 5`,
      hint: "priority_queue với greater<> để lấy đỉnh có d nhỏ nhất; bỏ qua cặp cũ khi du > d[u]; dùng long long; ghi parent khi cải thiện d[v].",
      solution: `#include <algorithm>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

typedef long long ll;
typedef pair<ll, int> pli;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n, m, s, t;
    cin >> n >> m >> s >> t;
    vector<vector<pair<int, ll>>> adj(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        ll w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }
    const ll INF = (ll)4e18;
    vector<ll> d(n + 1, INF);
    vector<int> parent(n + 1, 0);
    priority_queue<pli, vector<pli>, greater<pli>> pq;
    d[s] = 0;
    pq.push({0, s});
    while (!pq.empty()) {
        pli top = pq.top();
        pq.pop();
        ll du = top.first;
        int u = top.second;
        if (du > d[u]) continue;
        for (auto &e : adj[u]) {
            int v = e.first;
            ll w = e.second;
            if (d[u] + w < d[v]) {
                d[v] = d[u] + w;
                parent[v] = u;
                pq.push({d[v], v});
            }
        }
    }
    if (d[t] == INF) {
        cout << -1 << endl;
        return 0;
    }
    vector<int> path;
    for (int v = t; v != 0; v = parent[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    cout << d[t] << endl;
    for (size_t i = 0; i < path.size(); i++) cout << path[i] << (i + 1 < path.size() ? " " : "\\n");
    return 0;
}`,
      complexity: "O((n + m) log n)"
    },
    {
      id: "ch6-e8", title: "Floyd-Warshall: truy vấn khoảng cách", difficulty: "Khó",
      statement: `Cho đồ thị vô hướng có trọng số dương n đỉnh, m cạnh và q truy vấn. Mỗi truy vấn gồm hai đỉnh u v: in khoảng cách ngắn nhất giữa u và v, hoặc \`-1\` nếu không có đường đi.\n\n**Input**: dòng đầu n, m, q (n ≤ 400); m dòng sau u v w; q dòng sau u v.\n\n**Output**: q dòng.\n\n**Ví dụ**\n\nInput:\n6 9 3\n1 2 7\n1 3 9\n1 6 14\n2 3 10\n2 4 15\n3 4 11\n3 6 2\n4 5 6\n5 6 9\n1 5\n4 6\n2 6\n\nOutput:\n20\n13\n12`,
      hint: "Ma trận d với d[i][i] = 0, INF nếu chưa có cạnh; nếu có cạnh song song lấy trọng số nhỏ nhất. Ba vòng lặp k – i – j (k ngoài cùng). Kiểm tra d[i][k], d[k][j] khác INF.",
      solution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, m, q;
    cin >> n >> m >> q;
    const long long INF = (long long)1e18;
    vector<vector<long long>> d(n + 1, vector<long long>(n + 1, INF));
    for (int i = 1; i <= n; i++) d[i][i] = 0;
    for (int i = 0; i < m; i++) {
        int u, v;
        long long w;
        cin >> u >> v >> w;
        if (w < d[u][v]) {
            d[u][v] = w;
            d[v][u] = w;
        }
    }
    for (int k = 1; k <= n; k++)
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= n; j++)
                if (d[i][k] < INF && d[k][j] < INF && d[i][k] + d[k][j] < d[i][j])
                    d[i][j] = d[i][k] + d[k][j];
    while (q--) {
        int u, v;
        cin >> u >> v;
        if (d[u][v] >= INF) cout << -1 << endl;
        else cout << d[u][v] << endl;
    }
    return 0;
}`,
      complexity: "O(n³ + q)"
    }
  ]
});
