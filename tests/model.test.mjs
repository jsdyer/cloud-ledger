import test from 'node:test';
import assert from 'node:assert/strict';
import {filter,totals} from '../web/model.mjs';
test('base values and signed amendments stay separate',()=>{
 const rows=[['2025-2026-Q3','Oracle','abc','C',30000,null,30000,'ref','po','Oracle','Support',''],['2026-2027-Q1','Oracle','abc','A',30000,-10000,20000,'amend','po','Oracle','Support','']];
 assert.deepEqual(totals(rows),{original:30000,change:-10000,awards:1,amendments:1,missing:0});
 assert.equal(filter(rows,{query:'AMEND',dept:'abc',year:'2026'}).length,1);
});
