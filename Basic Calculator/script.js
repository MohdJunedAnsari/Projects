
    // Simple, robust calculator logic
    (function(){
      const exprEl = document.getElementById('expression');
      const resEl = document.getElementById('result');

      let expr = '';
      let lastResult = '0';

      function safeEval(s){
        // allow digits, operators, parentheses, decimal, percent
        if(!/^[0-9+\-*/().%\s]+$/.test(s)) throw new Error('Invalid characters');
        // transform percentage: replace n% with (n/100)
        s = s.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
        // avoid leading zeros pitfalls
        return Function('return ' + s)();
      }

      function render(){
        exprEl.textContent = expr || '0';
        resEl.textContent = lastResult;
      }

      function append(ch){
        expr += ch;
        render();
      }

      document.querySelectorAll('button[data-num]').forEach(b=> b.addEventListener('click', ()=>{
        append(b.getAttribute('data-num'));
      }));

      document.querySelectorAll('button[data-op]').forEach(b=> b.addEventListener('click', ()=>{
        const op = b.getAttribute('data-op');
        // avoid two operators in a row
        if(expr === '' && (op === '+' || op === '-')){ append(op); return; }
        if(/[+\-*/.]$/.test(expr)) expr = expr.slice(0,-1);
        append(op);
      }));

      document.getElementById('dot').addEventListener('click', ()=>{
        // prevent multiple dots in a number segment
        const parts = expr.split(/[^0-9.]/);
        const last = parts[parts.length-1] || '';
        if(last.includes('.')) return;
        append('.');
      });

      document.getElementById('clear').addEventListener('click', ()=>{
        expr = '';
        lastResult = '0';
        render();
      });

      document.getElementById('back').addEventListener('click', ()=>{
        expr = expr.slice(0,-1);
        render();
      });

      document.getElementById('percent').addEventListener('click', ()=>{
        append('%');
      });

      document.getElementById('equals').addEventListener('click', ()=>{
        try{
          if(!expr) return;
          const val = safeEval(expr);
          lastResult = String(Number.isFinite(val) ? +(+String(val)).toPrecision(12) : 'Error');
          render();
        }catch(e){ lastResult = 'Error'; render(); }
      });


      // keyboard support
      window.addEventListener('keydown', (ev)=>{
        if(ev.key >= '0' && ev.key <= '9') { append(ev.key); ev.preventDefault(); return; }
        if(['+','-','*','/','(',')','.'].includes(ev.key)){ append(ev.key); ev.preventDefault(); return; }
        if(ev.key === 'Enter'){ ev.preventDefault(); document.getElementById('equals').click(); return; }
        if(ev.key === 'Backspace'){ document.getElementById('back').click(); ev.preventDefault(); return; }
        if(ev.key === '%'){ append('%'); ev.preventDefault(); return; }
      });

      // initial render
      render();
    })();
  