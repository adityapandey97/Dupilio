import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '../../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import {
  Briefcase,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

const jobSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Job role is required'),
  status: z.enum(['Applied', 'OA', 'Interview', 'Selected', 'Rejected']),
  salary: z.string().optional(),
  appliedDate: z.string().min(1, 'Applied date is required'),
  notes: z.string().optional()
});

export const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const columns = ['Applied', 'OA', 'Interview', 'Selected', 'Rejected'];

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company: '',
      role: '',
      status: 'Applied',
      salary: '',
      appliedDate: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  const loadJobs = () => {
    api.getJobs().then(setJobs).catch(err => console.error('Failed to load jobs:', err));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const onAddJobSubmit = async (data) => {
    try {
      await api.addJob(data);
      loadJobs();
      setIsAddModalOpen(false);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveJob = async (jobId, newStatus) => {
    try {
      await api.updateJobStatus(jobId, newStatus);
      loadJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        await api.deleteJob(jobId);
        loadJobs();
        setSelectedJob(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (e, jobId) => {
    e.dataTransfer.setData('text/plain', jobId);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain');
    if (jobId) {
      handleMoveJob(jobId, status);
    }
  };

  const getLogoBg = (company) => {
    const char = company[0].toUpperCase();
    if ('ABCDE'.includes(char)) return 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300';
    if ('FGHIJ'.includes(char)) return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
    if ('KLMNO'.includes(char)) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
    if ('PQRST'.includes(char)) return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300';
    return 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300';
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Job Application Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Organize and manage your career applications. Drag and drop cards to update interview statuses.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          icon={<Plus size={16} />}
        >
          Add Job Application
        </Button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 pb-4 overflow-x-auto min-h-[500px]">
        {columns.map(col => {
          const colJobs = jobs.filter(j => j.status === col);
          
          return (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col)}
              className="flex-1 min-w-[250px] max-w-[320px] flex flex-col rounded-2xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-900 p-3 h-fit"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1.5 py-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${
                    col === 'Applied' ? 'bg-blue-500' :
                    col === 'OA' ? 'bg-purple-500' :
                    col === 'Interview' ? 'bg-amber-500' :
                    col === 'Selected' ? 'bg-emerald-500' :
                    'bg-red-500'
                  }`}></span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-350">{col}</span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-505">
                  {colJobs.length}
                </span>
              </div>

              {/* Cards wrapper */}
              <div className="space-y-3 overflow-y-auto max-h-[70vh] min-h-[150px]">
                {colJobs.map(job => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job.id)}
                    className="group relative cursor-grab active:cursor-grabbing rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-all duration-150"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm ${getLogoBg(job.company)}`}>
                          {job.company[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{job.company}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-450 line-clamp-1">{job.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                      >
                        <Info size={14} />
                      </button>
                    </div>

                    {job.salary && (
                      <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-450 font-medium">
                        <DollarSign size={10} className="shrink-0" />
                        <span>{job.salary}</span>
                      </div>
                    )}

                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-50 pt-2 dark:border-slate-850">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {job.appliedDate}
                      </span>
                      
                      {/* Move controls for mobile / accessibility */}
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {columns.indexOf(col) > 0 && (
                          <button
                            onClick={() => handleMoveJob(job.id, columns[columns.indexOf(col) - 1])}
                            className="rounded p-0.5 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400"
                            title="Move left"
                          >
                            <ChevronLeft size={12} />
                          </button>
                        )}
                        {columns.indexOf(col) < columns.length - 1 && (
                          <button
                            onClick={() => handleMoveJob(job.id, columns[columns.indexOf(col) + 1])}
                            className="rounded p-0.5 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-400"
                            title="Move right"
                          >
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {colJobs.length === 0 && (
                  <div className="flex flex-col items-center justify-center border border-dashed border-slate-200/80 rounded-xl py-8 text-center text-slate-400 text-xs dark:border-slate-800/80">
                    <Briefcase size={16} className="mb-1 text-slate-350" />
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Job Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Job Application"
      >
        <form className="space-y-4" onSubmit={handleSubmit(onAddJobSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Company Name"
              placeholder="e.g. Google"
              required
              error={errors.company}
              {...register('company')}
            />
            <Input
              label="Role"
              placeholder="e.g. Software Engineer"
              required
              error={errors.role}
              {...register('role')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="text-left">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Current Status
              </label>
              <select
                {...register('status')}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-850 focus:border-purple-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-250"
              >
                <option value="Applied">Applied</option>
                <option value="OA">OA (Online Assessment)</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            
            <Input
              label="Salary / Package (Optional)"
              placeholder="e.g. $140,000 or ₹18,00,000"
              error={errors.salary}
              {...register('salary')}
            />
          </div>

          <Input
            label="Applied Date"
            type="date"
            required
            error={errors.appliedDate}
            {...register('appliedDate')}
          />

          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              {...register('notes')}
              placeholder="Referrals, preparation focus areas, link to job post..."
              className="w-full h-24 p-3 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={`${selectedJob.company} Application Details`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b pb-3 mb-2 dark:border-slate-800">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${getLogoBg(selectedJob.company)}`}>
                {selectedJob.company[0]}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{selectedJob.company}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedJob.role}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedJob.status}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Package</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedJob.salary || 'Not specified'}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">Applied Date</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedJob.appliedDate}</span>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Application Notes</span>
              <p className="text-slate-650 dark:text-slate-350 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg leading-relaxed italic border dark:border-slate-800">
                {selectedJob.notes ? `"${selectedJob.notes}"` : 'No notes added for this job.'}
              </p>
            </div>

            <div className="flex items-center justify-between border-t pt-4 dark:border-slate-800">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteJob(selectedJob.id)}
                icon={<Trash2 size={12} />}
              >
                Delete Application
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedJob(null)}>
                Close Window
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default Jobs;
