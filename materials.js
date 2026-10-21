(function () {
  'use strict';

  var ACCEPT = '.pdf,.pptx,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.heic,.heif';
  var LIMITS = { maxFiles: 20, maxFileMB: 40, maxOcrPages: 30 };

  // Raise a structured extraction error.
  function fail(code, message) {
    throw { code: code, message: message };
  }

  // Normalize whitespace and Unicode while retaining paragraph boundaries.
  function norm(value) {
    return String(value || '')
      .normalize('NFC')
      .replace(/[\t\u00a0 ]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Decode XML text and its common entities.
  function xml(value) {
    return String(value || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, function (_, n) {
        return String.fromCodePoint(+n);
      });
  }

  // Extract paragraph text from a PowerPoint slide or notes XML file.
  function parsePptxXml(value) {
    return Array.from(String(value).matchAll(/<a:p(?:\s[^>]*)?>([\s\S]*?)<\/a:p>/g), function (match) {
      return norm(Array.from(match[1].matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g), function (text) {
        return xml(text[1]);
      }).join(''));
    }).filter(Boolean);
  }

  // Sort slide XML paths by their numeric slide number.
  function sortSlidePaths(paths) {
    return paths.slice().sort(function (a, b) {
      return +a.match(/slide(\d+)/)[1] - +b.match(/slide(\d+)/)[1];
    });
  }

  // Extract paragraphs and table rows from a Word document XML file.
  function parseDocxXml(value) {
    var out = [];

    function text(paragraph) {
      return norm(Array.from(paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g), function (match) {
        return xml(match[1]);
      }).join(''));
    }

    Array.from(String(value).matchAll(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>|<w:tbl(?:\s[^>]*)?>[\s\S]*?<\/w:tbl>/g))
      .forEach(function (block) {
        var value = block[0];
        if (/^<w:tbl/.test(value)) {
          Array.from(value.matchAll(/<w:tr(?:\s[^>]*)?>([\s\S]*?)<\/w:tr>/g)).forEach(function (row) {
            var cells = Array.from(row[1].matchAll(/<w:tc(?:\s[^>]*)?>([\s\S]*?)<\/w:tc>/g), function (cell) {
              return text(cell[1]);
            });
            if (cells.length) out.push(cells.join(' | '));
          });
        } else {
          var paragraph = text(value);
          if (paragraph) out.push(paragraph);
        }
      });
    return out;
  }

  // Remove repeated page numbers and repeated edge lines from page or slide text.
  function removeRepeatedEdgeLines(pages) {
    if (pages.length < 3) return { pages: pages.map(norm), removed: [] };

    // Khoá so khớp: chỉ gộp các dòng khác nhau ở con số khi dòng ngắn và trông như số trang
    // ("12", "- 12 -", "Trang 3/40", "Slide 7"); dòng nội dung phải trùng nguyên văn.
    function key(line) {
      var t = norm(line);
      var masked = t.replace(/\d+/g, '#');
      var looksLikePageNo = t.length <= 40 && (
        /^[\s\-–—|·.,:()\[\]\/#]*#[\s\-–—|·.,:()\[\]\/#]*$/.test(masked) ||
        /^(trang|page|slide|tr\.?)\s*#(\s*(\/|of|trên)\s*#)?$/i.test(masked));
      return looksLikePageNo ? masked : t;
    }

    var split = pages.map(function (page) { return norm(page).split('\n').filter(Boolean); });
    var occurrences = Object.create(null);
    var originals = Object.create(null);
    split.forEach(function (lines) {
      var seen = Object.create(null);
      lines.slice(0, 2).concat(lines.slice(-2)).forEach(function (line) {
        var k = key(line);
        if (!k || seen[k]) return;
        seen[k] = true;
        occurrences[k] = (occurrences[k] || 0) + 1;
        if (!originals[k]) originals[k] = line;
      });
    });

    var threshold = Math.ceil(pages.length * 0.5);
    var repeated = Object.create(null);
    Object.keys(occurrences).forEach(function (k) {
      if (occurrences[k] >= threshold) repeated[k] = true;
    });

    var removedKeys = Object.create(null);
    var cleaned = split.map(function (lines) {
      // Chỉ bỏ ở 2 dòng đầu / 2 dòng cuối của trang, không đụng phần giữa.
      var kept = lines.filter(function (line, i) {
        var atEdge = i < 2 || i >= lines.length - 2;
        if (atEdge && repeated[key(line)]) { removedKeys[key(line)] = true; return false; }
        return true;
      });
      // An toàn: không bao giờ làm trang trắng hẳn (vd slide chỉ có tiêu đề chương).
      return kept.length ? kept.join('\n') : lines.join('\n');
    });
    var removed = Object.keys(removedKeys).map(function (k) { return originals[k]; });
    return { pages: cleaned, removed: removed };
  }

  // Backward-compatible page-number cleanup helper.
  function removeRepeatedPageNumbers(pages) {
    return removeRepeatedEdgeLines(pages).pages;
  }

  // Split long source text into labeled units.
  function splitUnits(name, text, label) {
    var parts = norm(text).match(/[\s\S]{1,3000}(?:\s|$)/g) || [];
    return parts.map(function (part, index) {
      return { n: index + 1, label: label || 'Đoạn ' + (index + 1), text: norm(part) };
    }).filter(function (unit) {
      return unit.text;
    });
  }

  // Create the common material object and calculate its character count.
  function item(name, kind, units, more) {
    var chars = units.reduce(function (total, unit) {
      return total + unit.text.length;
    }, 0);
    return Object.assign({
      id: 'm' + Math.random().toString(36).slice(2, 10),
      name: name,
      kind: kind,
      units: units,
      chars: chars,
      needsOcr: false,
      ocrDone: false,
      warnings: []
    }, more || {});
  }

  // Build a text material from plain text.
  function fromText(name, text) {
    return item(name, 'text', splitUnits(name, text));
  }

  // Identify supported links without contacting any external service.
  function linkKind(value) {
    var url;
    try {
      url = new URL(String(value || '').trim());
      if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('scheme');
    } catch (_) {
      return { kind: 'invalid', label: 'Link không hợp lệ', server: '' };
    }
    var host = url.hostname.toLowerCase();
    var path = url.pathname;
    if (host === 'drive.google.com' && /\/drive\/folders\//.test(path)) {
      return { kind: 'drive-folder', id: (path.match(/\/folders\/([A-Za-z0-9_-]{20,})/) || [])[1], label: 'Thư mục Google Drive', server: 'Google Drive' };
    }
    if (host === 'drive.google.com') {
      var driveId = (path.match(/\/file\/d\/([A-Za-z0-9_-]{20,})/) || [])[1] || url.searchParams.get('id');
      if (driveId && /^[A-Za-z0-9_-]{20,}$/.test(driveId)) return { kind: 'drive', id: driveId, label: 'Google Drive', server: 'Google Drive' };
    }
    var doc = host === 'docs.google.com' && path.match(/^\/(document|presentation|spreadsheets)\/d\/([A-Za-z0-9_-]{20,})/);
    if (doc) return { kind: 'drive', id: doc[2], label: ({ document: 'Google Docs', presentation: 'Google Slides', spreadsheets: 'Google Sheets' })[doc[1]], server: 'Google Drive' };
    if (host === 'notion.so' || /\.notion\.site$/.test(host)) return { kind: 'notion', label: 'Notion', server: 'Notion' };
    if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com')) {
      return { kind: 'youtube', label: 'YouTube', server: 'host:claude_browser' };
    }
    return { kind: 'web', label: 'Trang web', server: 'host:claude_browser' };
  }

  // Extract useful text from nested connector responses in traversal order.
  function payloadText(value) {
    if (typeof value === 'string') return value;
    var found = [];
    function visit(node) {
      if (!node || typeof node !== 'object') return;
      Object.keys(node).forEach(function (key) {
        var child = node[key];
        if (typeof child === 'string' && child.length >= 200) found.push(child);
        else if (child && typeof child === 'object') visit(child);
      });
    }
    visit(value);
    return found.join('\n\n').replace(/<\/?(?:page|block|paragraph|text|heading|column_list|column)(?:\s[^>]*)?>/gi, ' ');
  }

  function linkError(error, server) {
    var code = error && error.code || 'unknown';
    var message;
    if (code === 'server_not_connected' && server === 'host:claude_browser') {
      // Trình duyệt của ứng dụng Claude desktop: không phải kết nối để "thêm" — chỉ có khi mở app trong Claude desktop.
      message = 'Trang web/YouTube chỉ đọc tự động được khi mở app này trong ứng dụng Claude desktop. Trên trình duyệt: ' +
        'YouTube — mở video → … → Hiện bản chép lời (Show transcript), sao chép; trang web — chọn hết (Ctrl+A), sao chép; rồi dùng nút Dán văn bản.';
    } else if (code === 'server_not_connected' || code === 'selection_required') {
      message = 'Chưa có kết nối ' + server + '. Thêm trong claude.ai → Cài đặt → Kết nối (Connectors), rồi thử lại.';
    } else if (code === 'needs_reauth') {
      message = 'Kết nối ' + server + ' đã hết hạn — kết nối lại trong claude.ai → Cài đặt → Kết nối.';
    } else if (code === 'not_in_manifest' || code === 'approval_required') {
      message = 'Bạn chưa cho phép app dùng ' + server + ' (hoặc đã từ chối). Bấm Đọc link lại và chọn Cho phép.';
    } else if (code === 'blocked_by_policy') {
      message = 'Tổ chức của bạn chặn ' + server + ' cho app này.';
    } else if (code === 'tool_error') {
      message = server + ' không đọc được link này: ' + (error.message || 'Lỗi công cụ') + '. Kiểm tra link đúng và tài khoản của bạn có quyền xem file.';
    } else if (code === 'server_unavailable') {
      message = server + ' đang không phản hồi, thử lại sau.';
    } else if (code === 'cancelled') {
      message = error.message || 'Đã huỷ.';
    } else {
      message = 'Không đọc được link (' + code + ').';
    }
    return { code: code, message: message };
  }

  async function linkAvailable() {
    return { mcp: !!(window.claude && await window.claude.use('mcp')) };
  }

  // Read a supported URL through the viewer's MCP capability.
  async function fromLink(value, opts) {
    opts = opts || {};
    var info = linkKind(value);
    var url = String(value || '').trim();
    if (info.kind === 'invalid') throw { code: 'bad_link', message: 'Link không hợp lệ.' };
    if (info.kind === 'drive-folder') throw { code: 'bad_link', message: 'Chưa hỗ trợ thư mục — dán link từng file.' };
    var guide = info.kind === 'youtube' ? 'Mở video → … → Hiện bản chép lời (Show transcript), sao chép rồi Dán văn bản' :
      info.kind === 'web' ? 'Mở trang, chọn hết (Ctrl+A), sao chép và dùng nút Dán văn bản' : '';
    if (opts.signal && opts.signal.aborted) throw { code: 'cancelled', message: 'Đã huỷ.' };
    var mcp = window.claude && await window.claude.use('mcp');
    if (!mcp) throw { code: 'no_mcp', message: guide || 'Mở app trong Claude để đọc link tự động.', kind: info.kind };
    async function call(server, tool, input) {
      for (var attempt = 0; ; attempt++) {
        try {
          var result = await mcp.callTool(server, tool, input, { signal: opts.signal });
          return result && result.payload;
        } catch (error) {
          if (error && error.code === 'server_unavailable' && attempt === 0) {
            await new Promise(function (resolve, reject) {
              var delay = 1500 + Math.random() * 1500;
              var timer = setTimeout(resolve, delay);
              if (opts.signal) opts.signal.addEventListener('abort', function () {
                clearTimeout(timer);
                reject({ code: 'cancelled', message: 'Đã huỷ.' });
              }, { once: true });
            });
            continue;
          }
          throw linkError(error, server);
        }
      }
    }
    var title = url;
    var content;
    if (info.kind === 'drive') {
      var drive = await call('Google Drive', 'read_file_content', { fileId: info.id });
      content = drive && drive.fileContent;
      title = drive && drive.title || title;
    } else if (info.kind === 'notion') {
      content = payloadText(await call('Notion', 'notion-fetch', { id: url }));
    } else {
      await call('host:claude_browser', 'navigate', { url: url });
      content = payloadText(await call('host:claude_browser', 'get_page_text', {}));
    }
    if (!content || !String(content).trim()) throw { code: 'tool_error', message: info.server + ' không trả nội dung văn bản.' };
    var units = splitLinkUnits(content);
    var result = item(title, 'link', units, {
      source: info.kind === 'drive' ? 'drive' : info.kind,
      url: url,
      needsOcr: false,
      ocrDone: true,
      warnings: String(content).length > 50000 ? ['File rất lớn có thể không đọc hết'] : []
    });
    if (opts.onProgress) opts.onProgress('Đã đọc link', 1);
    return result;
  }

  // Split Markdown headings into sections, falling back to roughly 3000 chars.
  function splitLinkUnits(text) {
    text = norm(text);
    var lines = text.split('\n');
    var sections = [];
    var current = '';
    var heading = '';
    lines.forEach(function (line) {
      if (/^#{1,2}\s+/.test(line) && current.trim()) {
        sections.push({ label: heading || 'Phần ' + (sections.length + 1), text: current.trim() });
        current = '';
      }
      if (/^#{1,2}\s+/.test(line)) heading = line.replace(/^#+\s+/, '').trim();
      current += (current ? '\n' : '') + line;
    });
    if (current.trim()) sections.push({ label: heading || 'Phần ' + (sections.length + 1), text: current.trim() });
    if (sections.length === 1 && sections[0].text.length > 3000) {
      return splitUnits('', sections[0].text).map(function (unit, index) {
        return { n: index + 1, label: 'Phần ' + (index + 1), text: unit.text };
      });
    }
    return sections.map(function (section, index) {
      return { n: index + 1, label: section.label || 'Phần ' + (index + 1), text: section.text };
    });
  }

  // Combine material units into bounded prompt chunks.
  function chunks(items) {
    var out = [];
    var sequence = 1;
    (items || []).forEach(function (material) {
      var buffer = [];
      var size = 0;
      var labels = [];
      function flush() {
        if (!buffer.length) return;
        out.push({
          id: 's' + sequence++,
          file: material.name,
          label: labels.length === 1 ? labels[0] : labels[0] + '–' + labels[labels.length - 1],
          text: buffer.join('\n\n')
        });
        buffer = [];
        size = 0;
        labels = [];
      }
      (material.units || []).forEach(function (unit) {
        var text = norm(unit.text);
        if (!text) return;
        while (text.length > 6000) {
          flush();
          out.push({ id: 's' + sequence++, file: material.name, label: unit.label, text: text.slice(0, 6000) });
          text = text.slice(6000);
        }
        if (size + text.length + (buffer.length ? 2 : 0) > 6000) flush();
        buffer.push(text);
        labels.push(unit.label);
        size += text.length + 2;
      });
      flush();
    });
    return out;
  }

  // Summarize material counts for the UI.
  function stats(items) {
    return (items || []).reduce(function (result, material) {
      result.files++;
      result.units += (material.units || []).length;
      result.chars += material.chars || 0;
      result.needsOcr += material.needsOcr ? 1 : 0;
      return result;
    }, { files: 0, units: 0, chars: 0, needsOcr: 0 });
  }

  // Extract text and metadata from a supported file.
  async function extract(file, opts) {
    opts = opts || {};
    if (opts.signal && opts.signal.aborted) throw { code: 'cancelled', message: 'Đã huỷ.' };
    if (!file || !file.size || file.size > LIMITS.maxFileMB * 1024 * 1024) fail('bad_file', 'Tệp rỗng, quá lớn hoặc không hợp lệ.');
    var name = file.name || 'Tài liệu';
    var ext = (name.split('.').pop() || '').toLowerCase();
    var bytes = new Uint8Array(await file.arrayBuffer());
    var units = [];
    var warnings = [];
    var kind = ext;

    if (ext === 'heic' || ext === 'heif') fail('bad_file', 'Ảnh HEIC chưa được hỗ trợ. Hãy chuyển sang PNG hoặc JPEG.');

    function progress(message, ratio) {
      if (opts.onProgress) opts.onProgress(message, ratio);
    }

    if (['txt', 'md', 'csv'].indexOf(ext) >= 0) {
      units = splitUnits(name, new TextDecoder('utf-8').decode(bytes));
      kind = 'text';
    } else if (ext === 'pdf') {
      if (!window.pdfjsLib || !window.JSZip) fail('lib_missing', 'Không nạp được thư viện đọc PDF/PPTX, tải lại trang');
      progress('Đang đọc PDF', 0.1);
      var pdf;
      try { pdf = await window.pdfjsLib.getDocument({ data: bytes, isEvalSupported: false }).promise; }
      catch (e) { fail('bad_file', e && (e.name === 'PasswordException' || e.code === 1 || e.code === 2) ? 'PDF có mật khẩu; hãy bỏ mật khẩu rồi tải lại.' : 'Không đọc được PDF; tệp có thể bị hỏng.'); }
      var pages = [];
      for (var pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        if (opts.signal && opts.signal.aborted) throw { code: 'cancelled', message: 'Đã huỷ.' };
        var page = await pdf.getPage(pageNumber);
        var content = await page.getTextContent();
        var lines = content.items.reduce(function (groups, part) {
          var y = Math.round((part.transform || [])[5] || 0);
          (groups[String(y)] || (groups[String(y)] = [])).push(part.str);
          return groups;
        }, {});
        pages.push(Object.keys(lines).sort(function (a, b) {
          return +b - +a;
        }).map(function (y) {
          return lines[y].join(' ');
        }).join('\n'));
        progress('Đang đọc trang ' + pageNumber, pageNumber / pdf.numPages);
        if (pageNumber % 2 === 0) await new Promise(function (resolve) { setTimeout(resolve, 0); });
      }
      var deduped = removeRepeatedEdgeLines(pages);
      if (deduped.removed.length) {
        warnings.push('Đã bỏ dòng tiêu đề/chân trang lặp lại: «' + deduped.removed.join('», «') + '»');
      }
      deduped.pages.forEach(function (text, index) {
        units.push({ n: index + 1, label: 'Trang ' + (index + 1), text: text });
      });
      var scan = units.filter(function (unit) {
        return unit.text.length < 30;
      });
      var result = item(name, 'pdf', units, {
        needsOcr: scan.length > 0,
        warnings: warnings.concat(scan.length ? ['Có trang scan cần OCR.'] : [])
      });
      if (scan.length) result._pdf = pdf;
      else if (typeof pdf.destroy === 'function') { try { await pdf.destroy(); } catch (_) { /* bỏ qua lỗi dọn tài nguyên */ } }
      return result;
    } else if (ext === 'pptx' || ext === 'docx') {
      if (!window.JSZip) fail('lib_missing', 'Không nạp được thư viện đọc PDF/PPTX, tải lại trang');
      var zip;
      try { zip = await window.JSZip.loadAsync(bytes); }
      catch (_) { fail('bad_file', 'Tệp PPTX/DOCX bị hỏng hoặc không phải tệp Office hợp lệ.'); }
      if (ext === 'pptx') {
        var slidePaths = sortSlidePaths(Object.keys(zip.files).filter(function (entry) {
          return /^ppt\/slides\/slide\d+\.xml$/.test(entry);
        }));
        var slides = [];
        for (var slideIndex = 0; slideIndex < slidePaths.length; slideIndex++) {
          var slideNumber = +slidePaths[slideIndex].match(/slide(\d+)/)[1];
          var slideText = parsePptxXml(await zip.file(slidePaths[slideIndex]).async('text')).join('\n');
          var notesFile = zip.file('ppt/notesSlides/notesSlide' + slideNumber + '.xml');
          if (notesFile) {
            var notes = parsePptxXml(await notesFile.async('text')).filter(function (line) {
              return !/^\d+$/.test(line);
            });
            if (notes.length) slideText += (slideText ? '\n' : '') + 'Ghi chú: ' + notes.join('\n');
          }
          slides.push(slideText);
          if (slideText.length < 40 && Object.keys(zip.files).some(function (entry) {
            return /^ppt\/media\//.test(entry);
          })) warnings.push('Slide ' + slideNumber + ' có thể chứa ảnh cần OCR.');
        }
        var cleanedSlides = removeRepeatedEdgeLines(slides);
        if (cleanedSlides.removed.length) {
          warnings.push('Đã bỏ dòng tiêu đề/chân trang lặp lại: «' + cleanedSlides.removed.join('», «') + '»');
        }
        cleanedSlides.pages.forEach(function (text, index) {
          units.push({ n: +slidePaths[index].match(/slide(\d+)/)[1], label: 'Slide ' + (+slidePaths[index].match(/slide(\d+)/)[1]), text: text });
        });
        kind = 'pptx';
      } else {
        var documentFile = zip.file('word/document.xml');
        if (!documentFile) fail('bad_file', 'Tệp DOCX bị hỏng.');
        units = splitUnits(name, parseDocxXml(await documentFile.async('text')).join('\n'));
        if (!units.length) fail('bad_file', 'Tệp DOCX không có chữ để trích xuất.');
        kind = 'docx';
      }
    } else if (['png', 'jpg', 'jpeg', 'webp'].indexOf(ext) >= 0) {
      return item(name, 'image', [{ n: 1, label: 'Ảnh', text: '' }], { needsOcr: true, _file: file });
    } else {
      fail('bad_file', 'Định dạng tệp không được hỗ trợ.');
    }
    return item(name, kind, units, { warnings: warnings });
  }

  // Render source pages or images and send them to the OCR service.
  async function ocr(material, opts) {
    opts = opts || {};
    if (opts.signal && opts.signal.aborted) throw { code: 'cancelled', message: 'Đã huỷ.' };
    var sample = window.sample || window.claude && await window.claude.use('sample');
    if (!sample) throw { code: 'images_unavailable', message: 'Không thể OCR tài liệu lúc này.' };
    var limits = typeof sample.limits === 'function' ? await sample.limits() : {};
    if (!limits.images) throw { code: 'images_unavailable', message: 'Claude chưa hỗ trợ đọc ảnh.' };
    var targets = material.kind === 'pdf' ? material.units.filter(function (unit) {
      return unit.text.length < 30;
    }) : material.units.slice(0, 1);
    if (targets.length > LIMITS.maxOcrPages) targets = targets.slice(0, LIMITS.maxOcrPages);

    async function render(unit) {
      if (material.kind === 'pdf') {
        var page = await material._pdf.getPage(unit.n);
        var viewport = page.getViewport({ scale: 1 });
        var scale = Math.min(3, 1600 / Math.max(viewport.width, viewport.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(viewport.width * scale);
        canvas.height = Math.round(viewport.height * scale);
        await page.render({
          canvasContext: canvas.getContext('2d'),
          viewport: page.getViewport({ scale: scale }),
          intent: 'print'
        }).promise;
        return await new Promise(function (resolve, reject) {
          canvas.toBlob(function (blob) {
            blob ? resolve(blob) : reject({ code: 'bad_file', message: 'Không thể chuyển trang PDF thành ảnh.' });
          }, 'image/png');
        });
      }
      var bitmap = await createImageBitmap(material._file);
      var imageScale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
      var imageCanvas = document.createElement('canvas');
      imageCanvas.width = Math.round(bitmap.width * imageScale);
      imageCanvas.height = Math.round(bitmap.height * imageScale);
      imageCanvas.getContext('2d').drawImage(bitmap, 0, 0, imageCanvas.width, imageCanvas.height);
      bitmap.close();
      return await new Promise(function (resolve, reject) {
        imageCanvas.toBlob(function (blob) {
          blob ? resolve(blob) : reject({ code: 'bad_file', message: 'Không thể đọc ảnh.' });
        }, 'image/png');
      });
    }

    for (var offset = 0; offset < targets.length; offset += 4) {
      if (opts.signal && opts.signal.aborted) throw { code: 'cancelled', message: 'Đã huỷ.' };
      var group = targets.slice(offset, offset + 4);
      var images = [];
      for (var index = 0; index < group.length; index++) {
        if (opts.signal && opts.signal.aborted) throw { code: 'cancelled', message: 'Đã huỷ.' };
        images.push(await render(group[index]));
      }
      var answer = await sample.json(
        'Chép lại CHÍNH XÁC toàn bộ chữ, công thức (dạng text), bảng (dạng | ), mô tả ngắn hình vẽ/sơ đồ trong [Hình: ...]. Trả JSON {"pages":[{"text":"..."}]}',
        { images: images, signal: opts.signal }
      );
      var recognizedPages = answer && answer.pages || [];
      if (!Array.isArray(recognizedPages) || !recognizedPages.length) throw { code: 'bad_output', message: 'Claude không trả nội dung OCR hợp lệ.' };
      group.forEach(function (unit, pageIndex) {
        unit.text = norm(recognizedPages[pageIndex] && recognizedPages[pageIndex].text || '');
      });
      if (opts.onProgress) {
        opts.onProgress('Đã OCR ' + Math.min(offset + group.length, targets.length) + '/' + targets.length,
          Math.min(offset + group.length, targets.length) / Math.max(1, targets.length));
      }
    }
    material.chars = material.units.reduce(function (total, unit) {
      return total + unit.text.length;
    }, 0);
    material.needsOcr = false;
    material.ocrDone = true;
    if (material._pdf && typeof material._pdf.destroy === 'function') {
      try { await material._pdf.destroy(); } catch (_) { /* tài nguyên đã được giải phóng */ }
      material._pdf = null;
    }
    if (!material.chars) fail('bad_file', 'Không tìm thấy chữ trong tài liệu; tài liệu toàn ảnh cần OCR thành công.');
    return material;
  }

  window.Materials = {
    accept: ACCEPT,
    limits: LIMITS,
    extract: extract,
    ocr: ocr,
    fromText: fromText,
    linkKind: linkKind,
    linkAvailable: linkAvailable,
    fromLink: fromLink,
    chunks: chunks,
    stats: stats,
    _normalize: norm,
    _removeRepeatedPageNumbers: removeRepeatedPageNumbers,
    _removeRepeatedEdgeLines: removeRepeatedEdgeLines,
    _parsePptxXml: parsePptxXml,
    _parseDocxXml: parseDocxXml,
    _sortSlidePaths: sortSlidePaths
  };
}());
