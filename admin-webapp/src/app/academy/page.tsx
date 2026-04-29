"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Plus, Search, Edit2, Trash2, Loader2, XCircle, Star, Users, Clock, IndianRupee, Video, Eye } from "lucide-react";
import { adminApi, Course } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";

type Lecture = Course['lectures'][number];

const CATEGORIES = ["Web Development", "App Development", "Freelancing", "Design", "Marketing"];

const emptyLecture: Lecture = { title: "", duration: "", videoUrl: "", freePreview: false };

const emptyForm = {
    title: "", description: "",
    instructor: { name: "", bio: "", avatar: "" },
    price: 0, originalPrice: 0, category: "Web Development",
    thumbnail: "", previewVideoUrl: "",
    lectures: [] as Lecture[], totalDuration: "",
    tags: [] as string[],
};

export default function AcademyPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState("");

    const fetchCourses = async () => {
        try {
            setIsLoading(true);
            const res = await adminApi.getCourses();
            setCourses(res.courses || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to fetch courses";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCourses(); }, []);

    const openCreateModal = () => {
        setEditingCourse(null);
        setFormData(emptyForm);
        setTagInput("");
        setIsModalOpen(true);
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title, description: course.description,
            instructor: { name: course.instructor?.name || "", bio: course.instructor?.bio || "", avatar: course.instructor?.avatar || "" },
            price: (course.price || 0) / 100, originalPrice: (course.originalPrice || 0) / 100,
            category: course.category, thumbnail: course.thumbnail,
            previewVideoUrl: course.previewVideoUrl || "",
            lectures: course.lectures || [], totalDuration: course.totalDuration || "",
            tags: course.tags || [],
        });
        setTagInput("");
        setIsModalOpen(true);
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput("");
        }
    };

    const addLecture = () => {
        setFormData(prev => ({ ...prev, lectures: [...prev.lectures, { ...emptyLecture }] }));
    };

    const updateLecture = (idx: number, field: keyof Lecture, value: string | boolean) => {
        setFormData(prev => {
            const lectures = [...prev.lectures];
            lectures[idx] = { ...lectures[idx], [field]: value };
            return { ...prev, lectures };
        });
    };

    const removeLecture = (idx: number) => {
        setFormData(prev => ({ ...prev, lectures: prev.lectures.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                price: Math.round(formData.price * 100),
                originalPrice: Math.round((formData.originalPrice || 0) * 100)
            };

            if (editingCourse) {
                await adminApi.updateCourse(editingCourse._id, payload);
                toast.success("Course updated successfully");
            } else {
                await adminApi.createCourse(payload);
                toast.success("Course created successfully");
            }
            setIsModalOpen(false);
            fetchCourses();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Operation failed";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            await adminApi.deleteCourse(id);
            toast.success("Course deleted");
            fetchCourses();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Delete failed";
            toast.error(message);
        }
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalEnrolled = courses.reduce((a, c) => a + (c.enrolledCount || 0), 0);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[500px]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Loading courses...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Academy</h1>
                        <p className="text-muted-foreground">Manage courses, lectures, and enrollments.</p>
                    </div>
                    <button onClick={openCreateModal} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4" /> New Course
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Total Courses", value: courses.length, icon: GraduationCap, color: "text-blue-500" },
                        { label: "Total Enrolled", value: totalEnrolled, icon: Users, color: "text-green-500" },
                        { label: "Avg Rating", value: (courses.reduce((a, c) => a + c.rating, 0) / (courses.length || 1)).toFixed(1), icon: Star, color: "text-yellow-500" },
                        { label: "Total Lectures", value: courses.reduce((a, c) => a + (c.lectures?.length || 0), 0), icon: Video, color: "text-purple-500" },
                    ].map((stat) => (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}><stat.icon className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-black">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Search + Cards */}
                <div className="space-y-4">
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type="text" placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
                    </div>

                    {filteredCourses.length === 0 ? (
                        <div className="glass-panel rounded-3xl p-16 text-center text-muted-foreground">
                            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p>No courses found. Create your first course.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCourses.map((course) => (
                                <motion.div key={course._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="glass-panel rounded-2xl overflow-hidden border border-white/5 group hover:border-primary/20 transition-all">
                                    {/* Thumbnail */}
                                    <div className="relative h-40 bg-gradient-to-br from-primary/20 to-purple-600/20 overflow-hidden">
                                        {course.thumbnail ? (
                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><GraduationCap className="w-12 h-12 text-white/10" /></div>
                                        )}
                                        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(course)} className="p-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete(course._id, course.title)} className="p-2 rounded-lg bg-red-500/60 backdrop-blur-sm hover:bg-red-500/80 text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                        <span className="absolute top-3 left-3 text-[9px] font-black uppercase px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-white/10 text-white">
                                            {course.category}
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <h3 className="font-bold text-sm line-clamp-1">{course.title}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolledCount}</span>
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> {course.rating}</span>
                                            <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {course.lectures?.length || 0} lectures</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-black text-primary">₹{((course.price || 0) / 100).toLocaleString()}</span>
                                                {course.originalPrice && course.originalPrice > course.price && (
                                                    <span className="text-xs text-muted-foreground line-through">₹{(course.originalPrice / 100).toLocaleString()}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/5 pl-1.5 pr-3 py-1 rounded-full border border-white/5">
                                                <img 
                                                    src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor?.name || 'Instructor')}&background=random&color=fff`} 
                                                    alt={course.instructor?.name} 
                                                    className="w-7 h-7 rounded-full object-cover border border-white/10" 
                                                />
                                                <span className="text-[10px] font-medium text-muted-foreground">by {course.instructor?.name || "Unknown"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#121212] z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary"><GraduationCap className="w-5 h-5" /></div>
                                    <div>
                                        <h2 className="text-xl font-bold">{editingCourse ? "Edit Course" : "New Course"}</h2>
                                        <p className="text-xs text-muted-foreground">{editingCourse ? "Update course details" : "Create a new course"}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)}><XCircle className="w-6 h-6 text-muted-foreground hover:text-white transition-colors" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Title *</label>
                                        <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description *</label>
                                        <textarea required rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Instructor Name *</label>
                                        <input type="text" required value={formData.instructor.name} onChange={(e) => setFormData({ ...formData, instructor: { ...formData.instructor, name: e.target.value } })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Instructor Avatar URL</label>
                                        <div className="flex gap-2">
                                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden">
                                                <img 
                                                    src={formData.instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.instructor.name || 'Instructor')}&background=random&color=fff`} 
                                                    className="w-full h-full object-cover" 
                                                    alt="Preview"
                                                />
                                            </div>
                                            <input type="text" value={formData.instructor.avatar} onChange={(e) => setFormData({ ...formData, instructor: { ...formData.instructor, avatar: e.target.value } })}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" placeholder="https://..." />
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Instructor Bio</label>
                                        <textarea rows={2} value={formData.instructor.bio} onChange={(e) => setFormData({ ...formData, instructor: { ...formData.instructor, bio: e.target.value } })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm resize-none" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category *</label>
                                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm">
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Duration</label>
                                        <input type="text" value={formData.totalDuration} onChange={(e) => setFormData({ ...formData, totalDuration: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" placeholder="e.g. 8h 30m" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price (₹) *</label>
                                        <input type="number" required min={0} value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Original Price (₹)</label>
                                        <input type="number" min={0} value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" />
                                    </div>

                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Thumbnail URL *</label>
                                        <input type="text" required value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" />
                                    </div>

                                    <div className="col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tags (Enter to add)</label>
                                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 focus:outline-none text-sm" placeholder="Add tags..." />
                                        {formData.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {formData.tags.map((tag, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                                                        {tag}
                                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, j) => j !== i) }))} className="hover:text-red-400">×</button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Lectures Section */}
                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold flex items-center gap-2"><Video className="w-4 h-4 text-primary" /> Lectures ({formData.lectures.length})</h3>
                                        <button type="button" onClick={addLecture} className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all flex items-center gap-1">
                                            <Plus className="w-3 h-3" /> Add Lecture
                                        </button>
                                    </div>
                                    {formData.lectures.map((lec, i) => (
                                        <div key={i} className="bg-white/[0.02] rounded-xl p-3 space-y-2 border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Lecture {i + 1}</span>
                                                <button type="button" onClick={() => removeLecture(i)} className="p-1 hover:bg-red-500/10 rounded text-muted-foreground hover:text-red-500 transition-all"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" placeholder="Title" value={lec.title} onChange={(e) => updateLecture(i, "title", e.target.value)}
                                                    className="col-span-2 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs focus:outline-none" />
                                                <input type="text" placeholder="Duration (e.g. 10:30)" value={lec.duration} onChange={(e) => updateLecture(i, "duration", e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs focus:outline-none" />
                                                <input type="text" placeholder="Video URL" value={lec.videoUrl} onChange={(e) => updateLecture(i, "videoUrl", e.target.value)}
                                                    className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-xs focus:outline-none" />
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={lec.freePreview} onChange={(e) => updateLecture(i, "freePreview", e.target.checked)} className="accent-primary w-3 h-3" />
                                                <span className="text-xs text-muted-foreground">Free Preview</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-white/5 flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-11 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs uppercase transition-all">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-[2] h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 text-xs uppercase">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingCourse ? "Save Changes" : "Create Course"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
