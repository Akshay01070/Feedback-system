import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AnalyticsPanel = ({ responses }) => {
    // Process data to calculate averages
    const stats = useMemo(() => {
        if (!responses || responses.length === 0) return null;

        let totalScore = 0;
        let totalCount = 0;
        const questionScores = {}; // { questionText: { total: X, count: Y, section: Z } }

        responses.forEach(response => {
            if (!response.answers) return;

            response.answers.forEach(ans => {
                // Check if the answer is a valid numeric score between 1 and 5
                const num = parseInt(ans.answer, 10);
                if (!isNaN(num) && num >= 1 && num <= 5) {
                    // Update overall totals
                    totalScore += num;
                    totalCount += 1;

                    // Update per-question totals
                    const qText = ans.questionText || 'Unknown Question';
                    if (!questionScores[qText]) {
                        questionScores[qText] = { total: 0, count: 0, section: ans.section || 'General' };
                    }
                    questionScores[qText].total += num;
                    questionScores[qText].count += 1;
                }
            });
        });

        if (totalCount === 0) return null; // No scorable questions

        const overallAverage = (totalScore / totalCount).toFixed(2);

        // Format data for Recharts
        const chartData = Object.entries(questionScores).map(([questionText, data]) => {
            const avg = parseFloat((data.total / data.count).toFixed(2));
            // Truncate long question texts for the X-axis label
            const shortLabel = questionText.length > 25 ? questionText.substring(0, 25) + '...' : questionText;
            return {
                fullQuestion: questionText,
                shortLabel,
                average: avg,
                section: data.section,
                count: data.count
            };
        }).sort((a, b) => b.average - a.average); // Sort by highest score first

        return {
            overallAverage,
            totalScorableAnswers: totalCount,
            chartData
        };
    }, [responses]);

    if (!stats) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100 flex items-center justify-center">
                <p className="text-gray-500 italic">Not enough quantitative data to generate analytics yet.</p>
            </div>
        );
    }

    // Determine color based on average score
    const getScoreColor = (score) => {
        if (score >= 4.0) return '#10B981'; // Green
        if (score >= 3.0) return '#F59E0B'; // Yellow
        return '#EF4444'; // Red
    };

    const overallColor = getScoreColor(parseFloat(stats.overallAverage));

    return (
        <div className="bg-[#0f172a]/80 backdrop-blur-md rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.05)_inset] border border-cyan-900/50 p-6 mb-8 text-gray-200">
            <h3 className="text-xl font-black text-cyan-400 mb-6 flex items-center gap-3 tracking-wider text-glow-cyan">
                <span>📊</span> Analytics Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Overall Score Card */}
                <div className="bg-[#1e293b]/60 rounded-xl p-6 text-center border border-indigo-500/30 shadow-neon-blue relative overflow-hidden group flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Overall Rating</p>
                    <div className="text-5xl font-black text-blue-400 text-glow-blue">
                        {stats.overallAverage}
                        <span className="text-2xl text-blue-500/50 font-medium ml-1">/5</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-mono">Based on {stats.totalScorableAnswers} datapoints</p>
                </div>

                {/* Best Metric Card */}
                <div className="bg-[#1e293b]/60 rounded-xl p-6 border border-emerald-500/30 shadow-neon-emerald flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 opacity-50"></div>
                    <p className="text-sm font-bold text-emerald-500/70 mb-2 uppercase tracking-wider">🌟 Strongest Area</p>
                    {stats.chartData.length > 0 && (
                        <>
                            <p className="font-bold text-gray-200 leading-tight mb-3 line-clamp-2">
                                {stats.chartData[0].fullQuestion}
                            </p>
                            <p className="text-3xl font-black text-emerald-400 text-glow-emerald border-l-4 border-emerald-500 pl-3">
                                {stats.chartData[0].average.toFixed(2)}
                            </p>
                        </>
                    )}
                </div>

                {/* Weakest Metric Card */}
                <div className="bg-[#1e293b]/60 rounded-xl p-6 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)] flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 opacity-50"></div>
                    <p className="text-sm font-bold text-rose-500/70 mb-2 uppercase tracking-wider">📈 Needs Focus</p>
                    {stats.chartData.length > 0 && (
                        <>
                            <p className="font-bold text-gray-200 leading-tight mb-3 line-clamp-2">
                                {stats.chartData[stats.chartData.length - 1].fullQuestion}
                            </p>
                            <p className="text-3xl font-black text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] border-l-4 border-rose-500 pl-3">
                                {stats.chartData[stats.chartData.length - 1].average.toFixed(2)}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Bar Chart */}
            <div className="mt-8 bg-[#0a0f18]/50 rounded-xl p-6 border border-gray-800 shadow-[0_0_20px_rgba(0,0,0,0.5)_inset]">
                <h4 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-6 text-center border-b border-gray-800 pb-4">Average Score Breakdown</h4>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={stats.chartData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis 
                                dataKey="shortLabel" 
                                angle={-45} 
                                textAnchor="end" 
                                interval={0} 
                                height={80} 
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                stroke="#334155"
                            />
                            <YAxis 
                                domain={[0, 5]} 
                                ticks={[0, 1, 2, 3, 4, 5]}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                stroke="#334155"
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: '1px solid rgba(0,255,255,0.3)', backgroundColor: 'rgba(15,23,42,0.95)', color: '#e2e8f0', boxShadow: '0 0 15px rgba(0,255,255,0.1)' }}
                                cursor={{ fill: 'rgba(0,255,255,0.05)' }}
                                formatter={(value, name, props) => {
                                    return [<span className="font-bold text-cyan-400 text-red-500">{value} / 5</span>, "Average Score"];
                                }}
                                labelFormatter={(label, payload) => {
                                    if(payload && payload.length > 0) {
                                        return payload[0].payload.fullQuestion;
                                    }
                                    return label;
                                }}
                            />
                            <Bar 
                                dataKey="average" 
                                radius={[4, 4, 0, 0]} 
                                barSize={40}
                                animationDuration={1500}
                            >
                                {stats.chartData.map((entry, index) => {
                                    const value = entry.average;
                                    let fill = '#00ffff'; // cyan
                                    if(value < 3) fill = '#f43f5e'; // rose
                                    else if(value < 4) fill = '#f59e0b'; // amber
                                    else if(value >= 4.5) fill = '#00ff66'; // emerald
                                    return <Cell key={`cell-${index}`} fill={fill} style={{ filter: `drop-shadow(0 0 8px ${fill}80)` }} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-widest text-gray-500">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(0,255,102,0.8)] border border-emerald-400"></span> Excellent (4.5+)</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.8)] border border-cyan-300"></span> Good (4.0 - 4.4)</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] border border-amber-400"></span> Average (3.0 - 3.9)</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] border border-rose-400"></span> Poor (&lt; 3.0)</div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;
