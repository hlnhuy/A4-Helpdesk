import { useMemo, useState } from 'react';
import RoleLayout from '../../layouts/RoleLayout.jsx';
import Panel from '../../components/common/Panel.jsx';
import MetricCard from '../../components/common/MetricCard.jsx';
import DonutChart from '../../components/common/DonutChart.jsx';
import BarList from '../../components/common/BarList.jsx';
import TicketTable from '../../components/common/TicketTable.jsx';
import useDemoData from '../../hooks/useDemoData.js';
import { exportCsv, getTickets } from '../../services/demoDataService.js';
import { getCategories } from '../../services/categoryService.js';
import { getUsers } from '../../services/userService.js';

export default function Reports() {
  const [tickets]=useDemoData(getTickets);
  const [categories]=useDemoData(getCategories);
  const [users]=useDemoData(getUsers);
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [category,setCategory]=useState('');
  const [status,setStatus]=useState('');
  const [technician,setTechnician]=useState('');
  const filtered=useMemo(()=>tickets.filter(ticket=>!from||ticket.createdAt.slice(0,10)>=from)
    .filter(ticket=>!to||ticket.createdAt.slice(0,10)<=to)
    .filter(ticket=>!category||ticket.category===category)
    .filter(ticket=>!status||ticket.status===status)
    .filter(ticket=>!technician||ticket.technicianId===technician),[tickets,from,to,category,status,technician]);
  const statusNames=['Mới tiếp nhận','Đang xử lý','Đã giải quyết','Đã đóng'];
  const statuses=statusNames.map(name=>filtered.filter(ticket=>ticket.status===name).length);
  const techs=users.filter(user=>user.role==='technician');
  function downloadCsv() {
    const blob=new Blob([exportCsv(filtered)],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download='a4-helpdesk-report.csv';anchor.click();
    URL.revokeObjectURL(url);
  }
  function reset() {setFrom('');setTo('');setCategory('');setStatus('');setTechnician('');}
  const overdue=filtered.filter(ticket=>!['Đã giải quyết','Đã đóng'].includes(ticket.status)&&new Date(ticket.slaAt)<new Date()).length;
  return <RoleLayout role="admin" title="Báo cáo & thống kê">
    <Panel className="report-filters">
      <div><label>Từ <input type="date" value={from} onChange={event=>setFrom(event.target.value)}/></label>
        <label>Đến <input type="date" value={to} onChange={event=>setTo(event.target.value)}/></label>
        <select aria-label="Loại sự cố" value={category} onChange={event=>setCategory(event.target.value)}><option value="">Mọi loại sự cố</option>{categories.map(item=><option key={item}>{item}</option>)}</select>
        <select aria-label="Trạng thái" value={status} onChange={event=>setStatus(event.target.value)}><option value="">Mọi trạng thái</option>{statusNames.map(item=><option key={item}>{item}</option>)}</select>
        <select aria-label="Kỹ thuật viên" value={technician} onChange={event=>setTechnician(event.target.value)}><option value="">Mọi KTV</option>{techs.map(item=><option key={item.id} value={item.id}>{item.full_name}</option>)}</select>
        <button className="text-button" type="button" onClick={reset}>Xóa lọc</button>
      </div>
      <div><button className="button button-secondary" onClick={downloadCsv}>Xuất CSV</button><button className="button button-secondary" onClick={()=>window.print()}>In báo cáo</button></div>
    </Panel>
    <div className="metric-grid report-metrics"><MetricCard label="Tổng số phiếu" value={filtered.length}/><MetricCard label="Chờ phân công TB" value="2 phút"/><MetricCard label="Phản hồi TB" value="45 phút"/><MetricCard label="Xử lý TB" value="1 giờ 56 phút"/><MetricCard label="Quá hạn SLA" value={overdue}/><MetricCard label="Hài lòng TB" value="4.0 / 5"/></div>
    <div className="dashboard-grid report-charts">
      <Panel><h2>Tổng số phiếu theo trạng thái</h2><div className="chart-legend"><DonutChart total={filtered.length} values={statuses}/><ul>{statusNames.map((name,index)=><li key={name}><i className={['legend-blue','legend-orange','legend-green','legend-gray'][index]}/>{name}: <b>{statuses[index]}</b></li>)}</ul></div></Panel>
      <Panel><h2>Phiếu theo loại sự cố</h2><BarList rows={categories.map(name=>[name,filtered.filter(ticket=>ticket.category===name).length])}/></Panel>
      <Panel><h2>Phiếu theo ngày</h2><div className="simple-bars">{Array.from({length:14},(_,index)=>{const day=new Date();day.setDate(day.getDate()-(13-index));const count=filtered.filter(ticket=>new Date(ticket.createdAt).toDateString()===day.toDateString()).length;return <div key={index}><strong>{count}</strong><i style={{height:`${Math.max(3,count*12)}px`}}/><small>{day.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'})}</small></div>;})}</div></Panel>
      <Panel><h2>Số phiếu đã giải quyết theo KTV</h2><BarList rows={techs.map(tech=>[tech.full_name,filtered.filter(ticket=>ticket.technicianId===tech.id&&['Đã giải quyết','Đã đóng'].includes(ticket.status)).length])}/></Panel>
    </div>
    <Panel className="table-card"><h2>Hiệu suất kỹ thuật viên</h2><div className="table-scroll"><table className="data-table"><thead><tr><th>KTV</th><th>Đang phụ trách</th><th>Đã giải quyết</th><th>Phản hồi TB</th><th>Xử lý TB</th></tr></thead><tbody>
      {techs.map(tech=><tr key={tech.id}><td>{tech.full_name}</td><td>{filtered.filter(ticket=>ticket.technicianId===tech.id&&ticket.status==='Đang xử lý').length}</td><td>{filtered.filter(ticket=>ticket.technicianId===tech.id&&['Đã giải quyết','Đã đóng'].includes(ticket.status)).length}</td><td>45 phút</td><td>1 giờ 56 phút</td></tr>)}
    </tbody></table></div></Panel>
    <Panel className="table-card"><h2>Chi tiết phiếu ({filtered.length})</h2><TicketTable tickets={filtered} linkPrefix="/admin/tickets" showTechnician/></Panel>
  </RoleLayout>;
}
