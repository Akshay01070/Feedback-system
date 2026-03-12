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
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>📊</span> Analytics Overview
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Overall Score Card */}
                <div 
                    className="p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm border border-gray-100"
                    style={{ backgroundColor: `${overallColor}15` }} // 15 = low opacity hex
                >
                    <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Overall Rating</p>
                    <div className="text-5xl font-extrabold" style={{ color: overallColor }}>
                        {stats.overallAverage}
                        <span className="text-2xl text-gray-400 font-medium">/5</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Based on {stats.totalScorableAnswers} datapoints</p>
                </div>

                {/* Best Metric Card */}
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">🌟 Strongest Area</p>
                    {stats.chartData.length > 0 && (
                        <>
                            <p className="font-bold text-gray-800 leading-tight mb-2 line-clamp-2">
                                {stats.chartData[0].fullQuestion}
                            </p>
                            <p className="text-2xl font-bold text-emerald-600 border-l-4 border-emerald-500 pl-3">
                                {stats.chartData[0].average.toFixed(2)}
                            </p>
                        </>
                    )}
                </div>

                {/* Weakest Metric Card */}
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">📈 Needs Focus</p>
                    {stats.chartData.length > 0 && (
                        <>
                            <p className="font-bold text-gray-800 leading-tight mb-2 line-clamp-2">
                                {stats.chartData[stats.chartData.length - 1].fullQuestion}
                            </p>
                            <p className="text-2xl font-bold text-amber-600 border-l-4 border-amber-500 pl-3">
                                {stats.chartData[stats.chartData.length - 1].average.toFixed(2)}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Bar Chart */}
            <div className="mt-8">
                <h4 className="text-lg font-bold text-gray-700 mb-4 px-2 border-b pb-2">Average Score Breakdown by Question</h4>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={stats.chartData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis 
                                dataKey="shortLabel" 
                                angle={-45} 
                                textAnchor="end" 
                                interval={0} 
                                height={80} 
                                tick={{ fontSize: 11, fill: '#6B7280' }}
                            />
                            <YAxis 
                                domain={[0, 5]} 
                                ticks={[0, 1, 2, 3, 4, 5]}
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                            />
                            <Tooltip 
                                cursor={{ fill: '#F3F4F6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value, name, props) => {
                                    return [value, "Average Score"];
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
                            >
                                {stats.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.average)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;
