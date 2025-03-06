// Minerva Agent - GitHub Pages Version
// Main application JavaScript

// API Keys (Note: In a production environment, these should be secured)
const FIRE_API = "fc-343fd362814545f295a89dc14ec4ee09"; 
const JINA_API = "jina_26a656e516224ce28e71cc3b28fa7b07zUchXe4_MJ_935m8SpS9-TNGL--w";
const DASHSCOPE_API = "sk-1a28c3fcc7e044cbacd6faf47dc89755";

// Data storage keys for localStorage
const STORAGE_KEYS = {
    WEBSITE_DATA: "minerva_website_data",
    TWITTER_DATA: "minerva_twitter_data",
    TWITTER_INSIGHTS: "minerva_twitter_insights",
    RAG_DATA: "minerva_rag_data",
    CHAT_HISTORY: "minerva_chat_history",
    SCHEDULED_TIME: "minerva_scheduled_time"
};

// Initialize the application when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Initialize all data from localStorage
    initializeData();
    
    // Set up event listeners for all interactive elements
    setupEventListeners();
    
    // Initialize UI components
    initializeUI();
});

// Function to initialize data from localStorage
function initializeData() {
    // Initialize website data
    const websiteData = loadWebsiteData();
    if (websiteData && Object.keys(websiteData).length > 0) {
        const timestamp = Object.values(websiteData)[0].timestamp || "未知";
        $("#websitesDataStatus").text(`已加载 ${Object.keys(websiteData).length} 个网站的历史数据。上次更新时间: ${timestamp}`);
        displayCachedWebsiteData(websiteData);
    }
    
    // Initialize Twitter data
    const twitterData = loadTwitterData();
    if (twitterData && twitterData.tweets && twitterData.tweets.length > 0) {
        $("#twitterDataStatus").text(`已加载 ${twitterData.tweets.length} 条推文数据。上次更新时间: ${twitterData.timestamp || "未知"}`);
        displayCachedTwitterData(twitterData);
    }
    
    // Initialize Twitter insights
    const twitterInsights = loadTwitterInsights();
    if (twitterInsights && twitterInsights.ai_insights) {
        displayCachedTwitterInsights(twitterInsights);
    }
    
    // Initialize RAG data
    const ragData = loadRagData();
    if (ragData) {
        displayRagData(ragData);
    }
    
    // Initialize chat history
    const chatHistory = loadChatHistory();
    if (chatHistory && chatHistory.length > 0) {
        displayChatHistory(chatHistory);
    }
    
    // Initialize scheduled time
    const scheduledTime = localStorage.getItem(STORAGE_KEYS.SCHEDULED_TIME) || "12:00";
    $("#scheduledTime").val(scheduledTime);
    $("#reportTimeDisplay").text(`当前设置的汇报时间为：${scheduledTime}`);
}

// Function to set up all event listeners
function setupEventListeners() {
    // Website monitoring tab
    $("#scrapeWebsitesBtn").click(handleWebsiteScrape);
    $("#rescrapeWebsitesBtn").click(handleWebsiteRescrape);
    $("#toggleCachedWebsiteBtn").click(toggleCachedWebsiteData);
    
    // Twitter monitoring tab
    $("#scrapeTwitterBtn").click(handleTwitterScrape);
    $("#rescrapeTwitterBtn").click(handleTwitterRescrape);
    $("#toggleCachedTwitterBtn").click(toggleCachedTwitterData);
    
    // Scheduled reports tab
    $("#saveScheduleBtn").click(saveScheduledTime);
    $("#scheduledTime").change(updateReportTimeDisplay);
    
    // RAG tab
    $("#addSourceForm").submit(handleAddSource);
    $("#uploadFileForm").submit(handleFileUpload);
    $("#clearRagDataBtn").click(clearRagData);
    
    // Chat tab
    $("#chatForm").submit(handleChatSubmit);
    $("#clearChatBtn").click(clearChatHistory);
}

// Function to initialize UI components
function initializeUI() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ------------------ Website Monitoring Functions ------------------

// Handle website scrape button click
function handleWebsiteScrape() {
    const websiteInput = $("#websiteInput").val();
    if (!websiteInput) {
        alert("请输入要监控的网站域名");
        return;
    }
    
    const websites = websiteInput.split(',').map(site => site.trim());
    if (websites.length === 0) {
        alert("请输入有效的网站域名");
        return;
    }
    
    // Show loading indicator
    $("#websiteScrapeLoading").show();
    $("#websiteScrapeStatus").text("正在抓取网站数据...");
    
    // Clear previous analysis
    $("#websiteAnalysisList").empty();
    
    // Process each website
    processWebsites(websites, false);
}

// Handle website rescrape button click
function handleWebsiteRescrape() {
    const websiteInput = $("#websiteInput").val();
    if (!websiteInput) {
        alert("请输入要监控的网站域名");
        return;
    }
    
    const websites = websiteInput.split(',').map(site => site.trim());
    if (websites.length === 0) {
        alert("请输入有效的网站域名");
        return;
    }
    
    // Show loading indicator
    $("#websiteScrapeLoading").show();
    $("#websiteScrapeStatus").text("正在重新抓取网站数据...");
    
    // Clear previous analysis and cache
    $("#websiteAnalysisList").empty();
    clearWebsiteData();
    
    // Process each website
    processWebsites(websites, true);
}

// Process websites for scraping
function processWebsites(websites, isRescrape) {
    let processedCount = 0;
    let websiteData = isRescrape ? {} : loadWebsiteData() || {};
    
    websites.forEach((site, index) => {
        setTimeout(() => {
            $("#websiteScrapeStatus").text(`正在${isRescrape ? '重新' : ''}拉取 ${site} 的数据...（${index + 1}/${websites.length}）`);
            
            // Call mockup API for demo purposes
            // In a real implementation, this would call the actual APIs
            mockGetRawHtml(site)
                .then(rawHtml => {
                    if (rawHtml.includes("Error") || rawHtml.includes("Failed")) {
                        const errorHtml = `
                            <div class="alert alert-danger mb-4">
                                <h5>❌ ${site}</h5>
                                <p>${rawHtml}</p>
                            </div>
                        `;
                        $("#websiteAnalysisList").append(errorHtml);
                    } else {
                        $("#websiteScrapeStatus").text(`正在分析 ${site} 的数据...`);
                        
                        // Analyze website content using mock API
                        mockAnalyzeWithQwen(site, rawHtml)
                            .then(analysis => {
                                // Save analysis data
                                websiteData[site] = {
                                    analysis: analysis,
                                    timestamp: new Date().toLocaleString('zh-CN')
                                };
                                
                                // Display analysis
                                const analysisHtml = `
                                    <div class="card mb-4">
                                        <div class="card-header bg-primary text-white">
                                            <h5 class="mb-0">${site}</h5>
                                        </div>
                                        <div class="card-body">
                                            <textarea class="form-control analysis-box" rows="10" readonly>${analysis}</textarea>
                                        </div>
                                    </div>
                                `;
                                $("#websiteAnalysisList").append(analysisHtml);
                                
                                // Save website data to localStorage
                                saveWebsiteData(websiteData);
                                
                                // Update cached data display
                                displayCachedWebsiteData(websiteData);
                            })
                            .catch(error => {
                                console.error("Error analyzing website:", error);
                                const errorHtml = `
                                    <div class="alert alert-danger mb-4">
                                        <h5>❌ ${site}</h5>
                                        <p>分析内容时出错: ${error.message}</p>
                                    </div>
                                `;
                                $("#websiteAnalysisList").append(errorHtml);
                            });
                    }
                    
                    processedCount++;
                    if (processedCount === websites.length) {
                        // All websites processed
                        $("#websiteScrapeLoading").hide();
                        
                        // Update status in the info box
                        const timestamp = new Date().toLocaleString('zh-CN');
                        $("#websitesDataStatus").text(`已加载 ${Object.keys(websiteData).length} 个网站的历史数据。上次更新时间: ${timestamp}`);
                    }
                })
                .catch(error => {
                    console.error("Error fetching website:", error);
                    const errorHtml = `
                        <div class="alert alert-danger mb-4">
                            <h5>❌ ${site}</h5>
                            <p>获取内容时出错: ${error.message}</p>
                        </div>
                    `;
                    $("#websiteAnalysisList").append(errorHtml);
                    
                    processedCount++;
                    if (processedCount === websites.length) {
                        // All websites processed
                        $("#websiteScrapeLoading").hide();
                    }
                });
        }, index * 1000); // Stagger requests to avoid rate limiting
    });
}

// Toggle showing/hiding cached website data
function toggleCachedWebsiteData() {
    const $button = $("#toggleCachedWebsiteBtn");
    const $cachedList = $("#cachedWebsitesList");
    
    if ($cachedList.is(":visible")) {
        $cachedList.hide();
        $button.text("显示历史数据");
    } else {
        $cachedList.show();
        $button.text("隐藏历史数据");
    }
}

// Display cached website data
function displayCachedWebsiteData(websiteData) {
    const $cachedList = $("#cachedWebsitesList");
    $cachedList.empty();
    
    if (!websiteData || Object.keys(websiteData).length === 0) {
        $cachedList.append('<div class="alert alert-info">没有缓存的网站数据</div>');
        return;
    }
    
    for (const [site, data] of Object.entries(websiteData)) {
        const cachedItemHtml = `
            <div class="card mb-3">
                <div class="card-header">
                    <h6 class="mb-0">${site} - 上次更新: ${data.timestamp || "未知"}</h6>
                </div>
                <div class="card-body">
                    <textarea class="form-control analysis-box" rows="8" readonly>${data.analysis || "没有数据"}</textarea>
                </div>
            </div>
        `;
        $cachedList.append(cachedItemHtml);
    }
}

// ------------------ Twitter Monitoring Functions ------------------

// Handle Twitter scrape button click
function handleTwitterScrape() {
    const selectedHandles = getSelectedTwitterHandles();
    if (selectedHandles.length === 0) {
        alert("请选择至少一个X账号进行监控");
        return;
    }
    
    // Show loading indicator
    $("#twitterScrapeLoading").show();
    $("#twitterScrapeStatus").text("正在抓取Twitter数据...");
    
    // Clear previous sections
    $("#aiInsightsSection, #topTweetsSection, #individualAnalysesSection").hide();
    
    // Mock Twitter scraping process
    mockScrapeTwitter(selectedHandles);
}

// Handle Twitter rescrape button click
function handleTwitterRescrape() {
    const selectedHandles = getSelectedTwitterHandles();
    if (selectedHandles.length === 0) {
        alert("请选择至少一个X账号进行监控");
        return;
    }
    
    // Show loading indicator
    $("#twitterScrapeLoading").show();
    $("#twitterScrapeStatus").text("正在重新抓取Twitter数据...");
    
    // Clear previous sections
    $("#aiInsightsSection, #topTweetsSection, #individualAnalysesSection").hide();
    
    // Clear Twitter data from storage
    clearTwitterData();
    
    // Mock Twitter scraping process
    mockScrapeTwitter(selectedHandles);
}

// Get selected Twitter handles from checkboxes
function getSelectedTwitterHandles() {
    const selectedHandles = [];
    $("#twitterHandlesList input[type='checkbox']:checked").each(function() {
        selectedHandles.push($(this).val());
    });
    return selectedHandles;
}

// Mock function to simulate Twitter scraping
function mockScrapeTwitter(handles) {
    $("#twitterScrapeStatus").text(`正在抓取 ${handles.length} 个AI专家的X数据...`);
    
    // Simulate API delay
    setTimeout(() => {
        // Generate mock tweets and analyses
        const mockTweets = generateMockTweets(handles);
        const mockAnalyses = generateMockAnalyses(handles);
        
        // Generate mock AI insights
        $("#twitterScrapeStatus").text("正在生成AI洞察分析...");
        setTimeout(() => {
            const mockAiInsights = generateMockAiInsights();
            
            // Generate mock top tweets
            $("#twitterScrapeStatus").text("正在获取和翻译最具互动性的推文...");
            setTimeout(() => {
                const mockTopTweets = generateMockTopTweets(mockTweets);
                
                // Save all data
                const twitterData = {
                    tweets: mockTweets,
                    analyses: mockAnalyses,
                    timestamp: new Date().toLocaleString('zh-CN')
                };
                saveTwitterData(twitterData);
                
                const insightsData = {
                    ai_insights: mockAiInsights,
                    top_engaging_tweets: mockTopTweets,
                    timestamp: new Date().toLocaleString('zh-CN')
                };
                saveTwitterInsights(insightsData);
                
                // Display the data
                displayTwitterData(twitterData, insightsData);
                
                // Hide loading
                $("#twitterScrapeLoading").hide();
                
                // Update status in the info box
                $("#twitterDataStatus").text(`已加载 ${mockTweets.length} 条推文数据。上次更新时间: ${new Date().toLocaleString('zh-CN')}`);
            }, 1000);
        }, 1500);
    }, 2000);
}

// Display Twitter data after scraping
function displayTwitterData(twitterData, insightsData) {
    // Display AI Insights
    if (insightsData && insightsData.ai_insights) {
        $("#aiInsightsContent").text(insightsData.ai_insights);
        $("#aiInsightsSection").show();
    }
    
    // Display Top Engaging Tweets
    if (insightsData && insightsData.top_engaging_tweets) {
        displayTopTweets(insightsData.top_engaging_tweets);
        $("#topTweetsSection").show();
    }
    
    // Display Individual Analyses
    if (twitterData && twitterData.analyses && twitterData.analyses.length > 0) {
        displayIndividualAnalyses(twitterData.analyses, twitterData.tweets);
        $("#individualAnalysesSection").show();
    }
}

// Display top tweets
function displayTopTweets(topTweets) {
    // Display top retweets
    displayTweetCategory(topTweets.top_retweets, "#topRetweetsList", "转发");
    
    // Display top replies
    displayTweetCategory(topTweets.top_replies, "#topRepliesList", "回复");
    
    // Display top likes
    displayTweetCategory(topTweets.top_likes, "#topLikesList", "点赞");
}

// Display a category of top tweets
function displayTweetCategory(tweets, containerId, metricName) {
    const $container = $(containerId);
    $container.empty();
    
    if (!tweets || tweets.length === 0) {
        $container.append('<div class="alert alert-info">没有数据</div>');
        return;
    }
    
    tweets.forEach((tweet, index) => {
        const tweetHtml = `
            <div class="card mb-3">
                <div class="card-header">
                    <h6 class="mb-0">${index + 1}. @${tweet.handle} (${metricName}: ${tweet[metricName === "转发" ? "retweets" : metricName === "回复" ? "replies" : "likes"]})</h6>
                </div>
                <div class="card-body">
                    <p><strong>作者：</strong> ${tweet.author} (@${tweet.handle})</p>
                    <p><strong>日期：</strong> ${tweet.date}</p>
                    <p><strong>原文：</strong> ${tweet.text}</p>
                    <p><strong>中文翻译：</strong> ${tweet.translation || "无翻译"}</p>
                    <p><strong>互动：</strong> 👍 ${tweet.likes} | 🔁 ${tweet.retweets} | 💬 ${tweet.replies}</p>
                    <p><strong>链接：</strong> <a href="${tweet.url}" target="_blank">查看原文</a></p>
                </div>
            </div>
        `;
        $container.append(tweetHtml);
    });
}

// Display individual analyses
function displayIndividualAnalyses(analyses, tweets) {
    const $container = $("#individualAnalysesList");
    $container.empty();
    
    if (!analyses || analyses.length === 0) {
        $container.append('<div class="alert alert-info">没有分析数据</div>');
        return;
    }
    
    analyses.forEach(analysis => {
        // Get tweets for this handle
        const handleTweets = tweets.filter(t => t.handle === analysis.handle);
        
        const analysisHtml = `
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">${analysis.author_name} (@${analysis.handle})</h5>
                </div>
                <div class="card-body">
                    <textarea class="form-control analysis-box mb-3" rows="8" readonly>${analysis.analysis}</textarea>
                    
                    <h6>@${analysis.handle} 的原始推文 (${handleTweets.length} 条)</h6>
                    <div class="tweet-list">
                        ${handleTweets.map(tweet => `
                            <div class="tweet mb-3 pb-3 border-bottom">
                                <p><strong>日期：</strong> ${tweet.date}</p>
                                <p><strong>内容：</strong> ${tweet.text}</p>
                                <p><strong>互动：</strong> 👍 ${tweet.likes} | 🔁 ${tweet.retweets} | 💬 ${tweet.replies}</p>
                                <p><strong>链接：</strong> <a href="${tweet.url}" target="_blank">查看原文</a></p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        $container.append(analysisHtml);
    });
}

// Toggle showing/hiding cached Twitter data
function toggleCachedTwitterData() {
    const $button = $("#toggleCachedTwitterBtn");
    const $cachedList = $("#cachedTwitterList");
    
    if ($cachedList.is(":visible")) {
        $cachedList.hide();
        $button.text("显示历史数据");
    } else {
        $cachedList.show();
        $button.text("隐藏历史数据");
    }
}

// Display cached Twitter data
function displayCachedTwitterData(twitterData) {
    const $cachedList = $("#cachedTwitterList");
    $cachedList.empty();
    
    if (!twitterData || !twitterData.tweets || twitterData.tweets.length === 0) {
        $cachedList.append('<div class="alert alert-info">没有缓存的Twitter数据</div>');
        return;
    }
    
    // Group tweets by handle
    const tweetsByHandle = {};
    twitterData.tweets.forEach(tweet => {
        if (!tweetsByHandle[tweet.handle]) {
            tweetsByHandle[tweet.handle] = [];
        }
        tweetsByHandle[tweet.handle].push(tweet);
    });
    
    // Display summary
    const cachedSummaryHtml = `
        <div class="alert alert-info mb-3">
            <p>缓存了 ${twitterData.tweets.length} 条推文，来自 ${Object.keys(tweetsByHandle).length} 个账号</p>
            <p>上次更新: ${twitterData.timestamp || "未知"}</p>
        </div>
    `;
    $cachedList.append(cachedSummaryHtml);
    
    // Display individual analyses if available
    if (twitterData.analyses && twitterData.analyses.length > 0) {
        const analysesHtml = `
            <div class="card mb-3">
                <div class="card-header">
                    <h6 class="mb-0">个人推文分析</h6>
                </div>
                <div class="card-body">
                    ${twitterData.analyses.map(analysis => `
                        <div class="mb-3 pb-3 border-bottom">
                            <h6>${analysis.author_name || ""} (@${analysis.handle})</h6>
                            <p>${analysis.analysis}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        $cachedList.append(analysesHtml);
    }
}

// Display cached Twitter insights
function displayCachedTwitterInsights(insightsData) {
    const $cachedList = $("#cachedTwitterList");
    
    if (!insightsData || !insightsData.ai_insights) {
        return;
    }
    
    // Display AI insights
    const insightsHtml = `
        <div class="card mb-3">
            <div class="card-header">
                <h6 class="mb-0">AI行业综合洞察 - 上次更新: ${insightsData.timestamp || "未知"}</h6>
            </div>
            <div class="card-body">
                <textarea class="form-control analysis-box" rows="8" readonly>${insightsData.ai_insights || "没有数据"}</textarea>
            </div>
        </div>
    `;
    $cachedList.append(insightsHtml);
    
    // Display top engaging tweets if available
    if (insightsData.top_engaging_tweets) {
        const topTweets = insightsData.top_engaging_tweets;
        
        if (topTweets.top_retweets && topTweets.top_retweets.length > 0) {
            const retweetsHtml = `
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">最高转发量推文</h6>
                    </div>
                    <div class="card-body">
                        ${topTweets.top_retweets.map((tweet, i) => `
                            <div class="mb-2">
                                <p><strong>${i+1}. @${tweet.handle} (转发: ${tweet.retweets})</strong> - ${tweet.text}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            $cachedList.append(retweetsHtml);
        }
        
        if (topTweets.top_likes && topTweets.top_likes.length > 0) {
            const likesHtml = `
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0">最高点赞量推文</h6>
                    </div>
                    <div class="card-body">
                        ${topTweets.top_likes.map((tweet, i) => `
                            <div class="mb-2">
                                <p><strong>${i+1}. @${tweet.handle} (点赞: ${tweet.likes})</strong> - ${tweet.text}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            $cachedList.append(likesHtml);
        }
    }
}

// ------------------ Scheduled Reports Functions ------------------

// Update report time display when input changes
function updateReportTimeDisplay() {
    const time = $("#scheduledTime").val();
    $("#reportTimeDisplay").text(`当前设置的汇报时间为：${time}`);
}

// Save scheduled time to localStorage
function saveScheduledTime() {
    const time = $("#scheduledTime").val();
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_TIME, time);
    alert(`汇报时间已设置为 ${time}`);
}

// ------------------ RAG Functions ------------------

// Handle adding a new source
function handleAddSource(event) {
    event.preventDefault();
    
    const sourceUrl = $("#newSourceUrl").val().trim();
    const sourceDesc = $("#sourceDescription").val().trim();
    
    if (!sourceUrl) {
        alert("请输入信息源网址");
        return;
    }
    
    // Show loading indicator
    $("#sourceAddLoading").show();
    $("#sourceAddStatus").text(`正在从 ${sourceUrl} 抓取内容...`);
    
    // Mock function to simulate fetching source content
    setTimeout(() => {
        // Get sanitized domain for fetching
        const domain = sourceUrl.replace(/^https?:\/\//, '');
        
        // Call mock API
        mockGetRawHtml(domain)
            .then(content => {
                // Get existing RAG data
                const ragData = loadRagData() || { local_facts: [], local_files: [] };
                
                // Add new source
                ragData.local_facts.push({
                    type: "website",
                    url: sourceUrl,
                    desc: sourceDesc,
                    content: content,
                    timestamp: new Date().toLocaleString('zh-CN')
                });
                
                // Save updated data
                saveRagData(ragData);
                
                // Update UI
                displayRagData(ragData);
                
                // Reset form
                $("#newSourceUrl").val("");
                $("#sourceDescription").val("");
                
                // Hide loading
                $("#sourceAddLoading").hide();
                
                // Show success message
                alert(`信息源 ${sourceUrl} 已添加，并提取内容！`);
            })
            .catch(error => {
                console.error("Error fetching source:", error);
                $("#sourceAddLoading").hide();
                alert(`获取 ${sourceUrl} 内容时出错: ${error.message}`);
            });
    }, 1500);
}

// Handle file upload
function handleFileUpload(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById("fileUpload");
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("请选择要上传的文件");
        return;
    }
    
    // Show loading indicator
    $("#fileUploadLoading").show();
    $("#fileUploadStatus").text(`正在处理 ${fileInput.files.length} 个文件...`);
    
    // Get existing RAG data
    const ragData = loadRagData() || { local_facts: [], local_files: [] };
    
    // Process each file
    let processedCount = 0;
    
    Array.from(fileInput.files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Get file content
            const fileContent = e.target.result;
            
            // Add file to RAG data
            ragData.local_files.push({
                type: "file",
                file_name: file.name,
                content: fileContent,
                timestamp: new Date().toLocaleString('zh-CN')
            });
            
            processedCount++;
            
            // Update status
            $("#fileUploadStatus").text(`已处理 ${processedCount}/${fileInput.files.length} 个文件...`);
            
            // Check if all files are processed
            if (processedCount === fileInput.files.length) {
                // Save updated data
                saveRagData(ragData);
                
                // Update UI
                displayRagData(ragData);
                
                // Reset form
                fileInput.value = "";
                
                // Hide loading
                $("#fileUploadLoading").hide();
                
                // Show success message
                alert(`已上传并处理 ${processedCount} 个文件！`);
            }
        };
        
        reader.onerror = function() {
            console.error(`Error reading file: ${file.name}`);
            processedCount++;
            
            // Check if all files are processed
            if (processedCount === fileInput.files.length) {
                // Save updated data
                saveRagData(ragData);
                
                // Update UI
                displayRagData(ragData);
                
                // Reset form
                fileInput.value = "";
                
                // Hide loading
                $("#fileUploadLoading").hide();
            }
        };
        
        // Read the file as text
        reader.readAsText(file);
    });
}

// Display RAG data
function displayRagData(ragData) {
    // Display website info
    const $websiteInfoList = $("#websiteInfoList");
    $websiteInfoList.empty();
    
    if (!ragData || !ragData.local_facts || ragData.local_facts.length === 0) {
        $("#noWebsiteInfo").show();
    } else {
        $("#noWebsiteInfo").hide();
        
        ragData.local_facts.forEach((fact, index) => {
            const factHtml = `
                <div class="mb-2">
                    <strong>${index + 1}.</strong> ${fact.url} — ${fact.desc}
                </div>
            `;
            $websiteInfoList.append(factHtml);
        });
    }
    
    // Display uploaded files
    const $uploadedFileList = $("#uploadedFileList");
    $uploadedFileList.empty();
    
    if (!ragData || !ragData.local_files || ragData.local_files.length === 0) {
        $("#noUploadedFiles").show();
    } else {
        $("#noUploadedFiles").hide();
        
        ragData.local_files.forEach((file, index) => {
            const fileHtml = `
                <div class="mb-2">
                    <strong>${index + 1}.</strong> ${file.file_name}
                </div>
            `;
            $uploadedFileList.append(fileHtml);
        });
    }
}

// Clear all RAG data
function clearRagData() {
    if (confirm("确定要清空所有本地信息吗？")) {
        // Clear data from localStorage
        localStorage.removeItem(STORAGE_KEYS.RAG_DATA);
        
        // Update UI
        displayRagData({ local_facts: [], local_files: [] });
        
        // Show success message
        alert("已清空所有本地信息！");
    }
}

// ------------------ Chat Functions ------------------

// Handle chat form submission
function handleChatSubmit(event) {
    event.preventDefault();
    
    const messageInput = $("#messageInput").val().trim();
    if (!messageInput) {
        return;
    }
    
    // Get selected chat mode
    const chatMode = $("input[name='chatMode']:checked").val();
    
    // Add user message to chat history
    addMessageToChat("user", messageInput);
    
    // Clear input
    $("#messageInput").val("");
    
    // Show loading indicator
    $("#chatLoading").show();
    
    // Get AI response based on selected mode
    if (chatMode === "qwen") {
        mockChatWithQwen(messageInput)
            .then(response => {
                addMessageToChat("assistant", response);
                $("#chatLoading").hide();
            })
            .catch(error => {
                console.error("Error in chat:", error);
                addMessageToChat("assistant", "很抱歉，处理您的消息时出错。请稍后再试。");
                $("#chatLoading").hide();
            });
    } else if (chatMode === "local") {
        mockChatWithLocalFacts(messageInput)
            .then(response => {
                addMessageToChat("assistant", response);
                $("#chatLoading").hide();
            })
            .catch(error => {
                console.error("Error in local chat:", error);
                addMessageToChat("assistant", "很抱歉，处理您的消息时出错。请稍后再试。");
                $("#chatLoading").hide();
            });
    } else if (chatMode === "deepseek") {
        mockChatWithDeepseek(messageInput)
            .then(response => {
                addMessageToChat("assistant", response);
                $("#chatLoading").hide();
            })
            .catch(error => {
                console.error("Error in Deepseek chat:", error);
                addMessageToChat("assistant", "很抱歉，处理您的消息时出错。请稍后再试。");
                $("#chatLoading").hide();
            });
    }
}

// Add a message to the chat history
function addMessageToChat(role, content) {
    const $chatHistory = $("#chatHistory");
    
    let messageHtml = "";
    if (role === "user") {
        messageHtml = `
            <div class="d-flex justify-content-end mb-3">
                <div class="user-message">
                    <p class="mb-0">${escapeHtml(content)}</p>
                </div>
            </div>
        `;
    } else {
        messageHtml = `
            <div class="d-flex mb-3">
                <div class="assistant-message">
                    <p class="mb-0">${escapeHtml(content).replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `;
    }
    
    $chatHistory.append(messageHtml);
    
    // Scroll to bottom
    $chatHistory.scrollTop($chatHistory[0].scrollHeight);
    
    // Save to chat history
    saveChatHistory();
}

// Display chat history from storage
function displayChatHistory(chatHistory) {
    const $chatHistory = $("#chatHistory");
    $chatHistory.empty();
    
    chatHistory.forEach(message => {
        addMessageToChat(message.role, message.content);
    });
}

// Clear chat history
function clearChatHistory() {
    if (confirm("确定要清空聊天记录吗？")) {
        // Clear chat history from localStorage
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
        
        // Clear chat display
        $("#chatHistory").empty();
        
        // Show success message
        alert("聊天记录已清空！");
    }
}

// ------------------ Storage Functions ------------------

// Load website data from localStorage
function loadWebsiteData() {
    const data = localStorage.getItem(STORAGE_KEYS.WEBSITE_DATA);
    return data ? JSON.parse(data) : null;
}

// Save website data to localStorage
function saveWebsiteData(data) {
    localStorage.setItem(STORAGE_KEYS.WEBSITE_DATA, JSON.stringify(data));
}

// Clear website data from localStorage
function clearWebsiteData() {
    localStorage.removeItem(STORAGE_KEYS.WEBSITE_DATA);
}

// Load Twitter data from localStorage
function loadTwitterData() {
    const data = localStorage.getItem(STORAGE_KEYS.TWITTER_DATA);
    return data ? JSON.parse(data) : null;
}

// Save Twitter data to localStorage
function saveTwitterData(data) {
    localStorage.setItem(STORAGE_KEYS.TWITTER_DATA, JSON.stringify(data));
}

// Load Twitter insights from localStorage
function loadTwitterInsights() {
    const data = localStorage.getItem(STORAGE_KEYS.TWITTER_INSIGHTS);
    return data ? JSON.parse(data) : null;
}

// Save Twitter insights to localStorage
function saveTwitterInsights(data) {
    localStorage.setItem(STORAGE_KEYS.TWITTER_INSIGHTS, JSON.stringify(data));
}

// Clear Twitter data from localStorage
function clearTwitterData() {
    localStorage.removeItem(STORAGE_KEYS.TWITTER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TWITTER_INSIGHTS);
}

// Load RAG data from localStorage
function loadRagData() {
    const data = localStorage.getItem(STORAGE_KEYS.RAG_DATA);
    return data ? JSON.parse(data) : null;
}

// Save RAG data to localStorage
function saveRagData(data) {
    localStorage.setItem(STORAGE_KEYS.RAG_DATA, JSON.stringify(data));
}

// Load chat history from localStorage
function loadChatHistory() {
    const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
}

// Save chat history to localStorage
function saveChatHistory() {
    const chatHistory = [];
    
    // Extract chat messages from DOM
    $("#chatHistory > div").each(function() {
        const $message = $(this).find("p");
        if ($message.length > 0) {
            const content = $message.html().replace(/<br>/g, '\n');
            const role = $(this).find(".user-message").length > 0 ? "user" : "assistant";
            chatHistory.push({
                role: role,
                content: unescapeHtml(content)
            });
        }
    });
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatHistory));
}

// ------------------ Mock API Functions ------------------

// Mock function to simulate getting raw HTML from a website
function mockGetRawHtml(domain) {
    return new Promise((resolve, reject) => {
        // Simulate API delay
        setTimeout(() => {
            if (Math.random() > 0.1) { // 10% chance of failure for demo purposes
                // Generate mock HTML content
                const mockHtml = `<!DOCTYPE html><html><head><title>${domain}</title></head><body><h1>Welcome to ${domain}</h1><p>This is mock content for demonstration purposes.</p></body></html>`;
                resolve(mockHtml);
            } else {
                reject(new Error(`Failed to fetch content from ${domain}`));
            }
        }, 1000);
    });
}

// Mock function to simulate analyzing website content with Qwen
function mockAnalyzeWithQwen(domain, rawHtml) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Generate mock analysis
            const currentDate = new Date().toLocaleDateString('zh-CN');
            const mockAnalysis = `以下是从${domain}提取的最新10个话题（${currentDate}）：

1. 大型语言模型的未来发展 | ${domain}
2. 人工智能在医疗领域的应用 | ${domain}
3. 自动驾驶技术最新进展 | ${domain}
4. 深度学习框架比较：PyTorch vs TensorFlow | ${domain}
5. 强化学习算法在实际应用中的挑战 | ${domain}
6. 计算机视觉技术在安防领域的应用 | ${domain}
7. 自然语言处理的最新研究成果 | ${domain}
8. AI伦理问题及监管挑战 | ${domain}
9. 机器学习在金融风控中的应用 | ${domain}
10. 人工智能硬件加速器的发展趋势 | ${domain}`;
            
            resolve(mockAnalysis);
        }, 1500);
    });
}

// Mock function to simulate chat with Qwen
function mockChatWithQwen(message) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Generate mock response
            let response = `您好！很高兴回答您的问题。`;
            
            if (message.includes("你好") || message.includes("您好")) {
                response = `您好！我是Qwen助手，有什么可以帮您的吗？`;
            } else if (message.includes("AI") || message.includes("人工智能")) {
                response = `人工智能（AI）是一个快速发展的领域，近年来取得了很多突破性进展，特别是在大型语言模型和生成式AI方面。目前，ChatGPT、Claude、Qwen等模型已经展示了强大的能力，能够理解和生成自然语言，辅助人类完成各种任务。`;
            } else if (message.includes("推荐") || message.includes("建议")) {
                response = `基于您的询问，我推荐您关注以下几个AI领域的最新发展：\n1. 大型语言模型（LLM）\n2. 多模态AI\n3. AI代理（Agent）\n4. 生成式AI应用\n这些领域正在快速发展，并有很多有趣的研究和应用。`;
            } else {
                response = `感谢您的提问。我理解您想了解关于"${message.substring(0, 20)}..."的信息。这是一个很好的问题，我会尽力提供有用的信息。目前AI技术正在快速发展，建议您关注最新的研究进展和行业动态，以获取更全面的了解。您还有其他问题吗？`;
            }
            
            resolve(response);
        }, 1000 + Math.random() * 1000);
    });
}

// Mock function to simulate chat with local facts
function mockChatWithLocalFacts(message) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Get RAG data
            const ragData = loadRagData() || { local_facts: [], local_files: [] };
            
            // Generate mock response
            let response = `基于本地知识库，`;
            
            if (ragData.local_facts.length === 0 && ragData.local_files.length === 0) {
                response += `我无法回答您的问题，因为本地知识库中没有数据。请先添加网站或上传文件。`;
            } else {
                // Count total sources
                const totalSources = ragData.local_facts.length + ragData.local_files.length;
                
                // Get random facts to include in response
                let randomFacts = [];
                if (ragData.local_facts.length > 0) {
                    const randomFactIndex = Math.floor(Math.random() * ragData.local_facts.length);
                    randomFacts.push(`从网站 ${ragData.local_facts[randomFactIndex].url} 中了解到：${ragData.local_facts[randomFactIndex].desc || "相关信息"}`);
                }
                if (ragData.local_files.length > 0) {
                    const randomFileIndex = Math.floor(Math.random() * ragData.local_files.length);
                    randomFacts.push(`从文件 ${ragData.local_files[randomFileIndex].file_name} 中了解到：相关内容`);
                }
                
                response += `我找到了以下信息：\n\n${randomFacts.join('\n\n')}\n\n基于以上信息，${message.includes("AI") || message.includes("人工智能") ? "人工智能是一个快速发展的领域，有着广泛的应用前景。" : "我认为这个问题的答案与您查询的内容相关。您可以继续添加更多资料来丰富知识库。"}`;
            }
            
            resolve(response);
        }, 1500 + Math.random() * 1000);
    });
}

// Mock function to simulate chat with Deepseek
function mockChatWithDeepseek(message) {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Generate mock response with thinking process
            let response = `我的思考过程：\n首先，我需要理解用户的问题，并提供准确的回答。用户问的是关于"${message.substring(0, 20)}..."的问题。\n考虑到这个问题的性质，我应该从以下几个方面来回答：\n1. 提供基本信息\n2. 分析相关趋势\n3. 给出建议\n\n最终答案：\n\n`;
            
            if (message.includes("你好") || message.includes("您好")) {
                response += `您好！我是Deepseek AI助手，很高兴为您服务。我可以回答您关于AI领域的各种问题，也可以进行创意写作、代码编写等任务。请问您今天有什么我可以帮助您的呢？`;
            } else if (message.includes("AI") || message.includes("人工智能")) {
                response += `人工智能（AI）是当前科技领域最活跃的研究方向之一。近期的发展主要集中在以下几个方面：

1. 大型语言模型（LLM）的规模和能力不断提升，如GPT-4、Claude、Llama 3等模型在理解和生成自然语言方面表现出色。

2. 多模态AI系统能够同时处理文本、图像、音频等多种数据类型，例如GPT-4V、Claude 3和Gemini等。

3. 代理（Agent）技术使AI能够自主规划和执行复杂任务，形成更高效的人机协作模式。

4. AI安全和对齐研究变得更加重要，研究人员正在探索如何确保AI系统按照人类意图行事。

目前，AI技术已经在医疗、金融、教育、创意内容创作等众多领域找到了实际应用。您对哪个具体方向感兴趣？我可以提供更详细的信息。`;
            } else if (message.includes("推荐") || message.includes("建议")) {
                response += `基于您的询问，我推荐您关注以下几个AI领域的最新发展和资源：

1. 大型语言模型（LLM）开源项目：
   - Llama 3已开源，可用于研究和应用开发
   - Mistral AI的模型系列提供了强大且高效的选择

2. AI学习资源：
   - Andrej Karpathy的"Neural Networks: Zero to Hero"视频系列
   - DeepLearning.AI的各类专业课程
   - Hugging Face的交互式教程

3. 值得关注的研究方向：
   - 小参数量模型的优化和能力提升
   - 智能体（Agent）技术的实际应用
   - 多模态学习与理解
   - AI系统安全和对齐

4. 开发工具和框架：
   - LangChain和LlamaIndex等RAG工具
   - Weights & Biases用于实验跟踪
   - Hugging Face的Transformers库

您有特定的应用场景或研究兴趣吗？我可以提供更有针对性的建议。`;
            } else {
                response += `感谢您的提问。关于"${message.substring(0, 30)}..."，这是一个很有深度的话题。

从目前的AI研究和应用趋势来看，我们可以观察到几个关键发展方向：

1. 模型规模和效率之间的平衡正变得越来越重要，研究人员不仅追求更大的模型，也在探索如何使小型模型达到更好的性能。

2. 多模态能力正在改变AI应用的形态，使系统能够理解和生成跨越不同感知维度的内容。

3. AI系统的推理能力和可靠性成为关注焦点，包括如何减少幻觉、提高事实准确性等方面。

4. 数据质量和多样性对模型性能的影响被广泛研究，高质量数据集的构建成为重要工作。

这个领域发展迅速，建议您关注主要研究机构（如Anthropic、OpenAI、Google DeepMind等）的最新论文和技术报告，以获取最前沿的进展。

您对这个话题有什么特定的关注点吗？我可以提供更具体的信息。`;
            }
            
            resolve(response);
        }, 2000 + Math.random() * 1500);
    });
}

// ------------------ Utility Functions ------------------

// Generate mock tweets for Twitter scraping
function generateMockTweets(handles) {
    const tweets = [];
    const topics = [
        "AI alignment research",
        "LLM capabilities",
        "Computer vision advances",
        "Reinforcement learning",
        "Multimodal AI",
        "AGI timeline predictions",
        "AI safety",
        "AI policy and regulation"
    ];
    
    handles.forEach(handle => {
        const tweetCount = 5 + Math.floor(Math.random() * 10); // 5-14 tweets per handle
        const authorName = {
            'sama': 'Sam Altman',
            'ylecun': 'Yann LeCun',
            'AndrewYNg': 'Andrew Ng',
            'fchollet': 'François Chollet',
            'karpathy': 'Andrej Karpathy',
            'ilyasut': 'Ilya Sutskever'
        }[handle] || handle;
        
        for (let i = 0; i < tweetCount; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const date = new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(); // Last 48 hours
            const likes = Math.floor(Math.random() * 5000);
            const retweets = Math.floor(Math.random() * 1000);
            const replies = Math.floor(Math.random() * 500);
            
            const tweetText = generateMockTweetText(handle, topic);
            
            tweets.push({
                author: authorName,
                handle: handle,
                text: tweetText,
                translation: generateMockTranslation(tweetText),
                date: date,
                likes: likes,
                retweets: retweets,
                replies: replies,
                url: `https://twitter.com/${handle}/status/${Date.now() + i}`
            });
        }
    });
    
    return tweets;
}

// Generate mock analyses for Twitter scraping
function generateMockAnalyses(handles) {
    const analyses = [];
    
    handles.forEach(handle => {
        const authorName = {
            'sama': 'Sam Altman',
            'ylecun': 'Yann LeCun',
            'AndrewYNg': 'Andrew Ng',
            'fchollet': 'François Chollet',
            'karpathy': 'Andrej Karpathy',
            'ilyasut': 'Ilya Sutskever'
        }[handle] || handle;
        
        analyses.push({
            handle: handle,
            author_name: authorName,
            analysis: generateMockAnalysisText(handle)
        });
    });
    
    return analyses;
}

// Generate mock tweet text
function generateMockTweetText(handle, topic) {
    const tweetTemplates = [
        `Excited about the latest developments in ${topic}. We're making great progress!`,
        `Just published a new paper on ${topic}. Check it out: example.com/paper`,
        `Had a great conversation with colleagues about ${topic} today. So many interesting ideas!`,
        `What are your thoughts on ${topic}? Curious to hear different perspectives.`,
        `The future of ${topic} looks incredibly promising. Can't wait to see what's next!`,
        `Working on a new project related to ${topic}. More details coming soon!`,
        `Interesting read on ${topic}: example.com/article #AI #Research`
    ];
    
    // Handle-specific tweets
    if (handle === 'sama') {
        return `${tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)]} The potential of AI to help humanity is immense.`;
    } else if (handle === 'ylecun') {
        return `${tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)]} Self-supervised learning is key to advancing AI.`;
    } else if (handle === 'AndrewYNg') {
        return `${tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)]} AI is transforming industries worldwide. Education is crucial.`;
    } else {
        return tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
    }
}

// Generate mock translation
function generateMockTranslation(text) {
    // Simple mock translation - in a real app, this would call a translation service
    if (text.includes("Excited about")) {
        return `对${text.split("in ")[1].split(".")[0]}的最新发展感到兴奋。我们正在取得很大进展！`;
    } else if (text.includes("Just published")) {
        return `刚刚发表了一篇关于${text.split("on ")[1].split(".")[0]}的新论文。请查看：example.com/paper`;
    } else if (text.includes("Had a great conversation")) {
        return `今天和同事们就${text.split("about ")[1].split(".")[0]}进行了很好的交流。有很多有趣的想法！`;
    } else {
        return `关于"${text.slice(0, 30)}..."的中文翻译。人工智能正在快速发展，未来充满可能性。`;
    }
}

// Generate mock analysis text
function generateMockAnalysisText(handle) {
    const currentDate = new Date().toLocaleDateString('zh-CN');
    
    if (handle === 'sama') {
        return `@sama (Sam Altman) 最新推文分析（${currentDate}）：

主要话题：
1. 人工通用智能（AGI）发展
2. AI安全与对齐研究
3. OpenAI的最新进展

简要总结：
Sam Altman最近的推文主要关注AI技术的安全发展和人类福祉。他强调了AI对齐研究的重要性，并表示OpenAI正在积极推进相关工作。同时，他也分享了对AGI发展时间线的一些思考，认为技术进步速度可能超出许多人的预期。

重要公告：
Sam提到OpenAI即将发布新的研究成果，但尚未透露具体细节。他也表示公司正在招募更多AI安全研究人员，显示了对这一领域的重视。`;
    } else if (handle === 'ylecun') {
        return `@ylecun (Yann LeCun) 最新推文分析（${currentDate}）：

主要话题：
1. 自监督学习技术
2. AI发展路径观点
3. 神经网络架构创新

简要总结：
Yann LeCun近期推文主要分享了他对自监督学习的研究见解，认为这是实现更通用AI系统的关键路径。他对比了不同的学习范式，并探讨了当前语言模型的局限性。LeCun还批评了一些关于AI风险的观点，提出了自己对AI发展更为乐观的立场。

重要公告：
LeCun提到他的团队正在开发新的神经网络架构，旨在克服当前模型在世界模型构建和推理方面的局限，相关论文将在近期发布。`;
    } else if (handle === 'AndrewYNg') {
        return `@AndrewYNg (Andrew Ng) 最新推文分析（${currentDate}）：

主要话题：
1. AI教育与人才培养
2. 医疗AI应用进展
3. 企业AI转型

简要总结：
Andrew Ng的最新推文主要关注AI教育和实际应用。他分享了多个关于如何有效学习AI的建议，并强调了实践项目的重要性。在医疗领域，Ng讨论了AI诊断工具的最新进展，以及如何负责任地部署这些技术。他还探讨了企业如何战略性地整合AI技术，提升业务效率。

重要公告：
Andrew宣布了DeepLearning.AI的几门新课程，专注于大型语言模型的应用开发。他还提到正在与几家医疗机构合作开发新的AI诊断工具，旨在提高医疗可及性。`;
    } else {
        return `@${handle} 最新推文分析（${currentDate}）：

主要话题：
1. AI研究进展
2. 技术挑战与解决方案
3. 行业应用探讨

简要总结：
该AI专家近期推文主要围绕人工智能领域的最新研究成果和技术挑战展开讨论。推文内容涉及模型优化、应用场景分析以及对行业发展趋势的见解。专家强调了技术创新与实际应用之间的平衡，并分享了一些关于如何解决当前AI系统局限性的思考。

重要公告：
推文中提到了几个正在进行的研究项目，但没有重大公告或新产品发布消息。`;
    }
}

// Generate mock AI insights
function generateMockAiInsights() {
    const currentDate = new Date().toLocaleDateString('zh-CN');
    
    return `# AI行业综合洞察分析（${currentDate}）

## 最新AI技术趋势
* 大型语言模型（LLM）正在从规模竞赛转向效率优化，研究人员更关注如何用更少的参数和计算资源获得更好的性能
* 多模态AI系统成为热点，能够同时处理文本、图像、音频等多种数据类型的模型受到广泛关注
* AI代理（Agent）技术正在快速发展，具有自主规划和执行复杂任务能力的系统开始出现
* 小参数量开源模型的崛起，性能不断接近大型专有模型

## 研究方向前沿
* 自监督学习仍是提升模型能力的重要方向，特别是在减少标注数据需求方面
* AI推理能力增强成为研究热点，包括提高逻辑推理、数学能力和事实准确性
* 长上下文理解能力显著提升，模型能够处理更长的输入文本并保持连贯性
* 对齐技术研究持续深入，包括人类反馈强化学习（RLHF）和其他新型对齐方法

## 行业发展动态
* 企业级AI应用正从实验阶段转向大规模部署，越来越多的公司将AI整合到核心业务流程中
* AI创业公司融资环境虽有调整但仍保持活跃，特别是专注于垂直领域应用的创业公司
* 大型科技公司继续巩固AI领域的主导地位，通过开源部分技术同时保留核心优势
* 医疗、金融和教育成为AI应用最活跃的行业，实际落地案例不断增加

## 未来AI展望
* 通用人工智能（AGI）发展时间线预测分化明显，但普遍认为关键能力正在加速发展
* AI技术民主化趋势将继续，降低使用门槛和成本，使更多组织和个人能够获取AI能力
* 安全和伦理问题受到更多关注，行业自律和政府监管同步发展
* 人机协作模式将成为主流，AI系统作为人类能力的扩展，而非完全替代

这份分析基于行业领袖近期的社交媒体讨论，反映了当前AI领域的主要关注点和发展方向。技术进步速度仍然很快，各方对未来发展路径存在不同见解，但对AI潜力的乐观态度是普遍共识。`;
}

// Generate mock top tweets
function generateMockTopTweets(allTweets) {
    // Sort tweets by different metrics
    const sortedByRetweets = [...allTweets].sort((a, b) => b.retweets - a.retweets).slice(0, 5);
    const sortedByReplies = [...allTweets].sort((a, b) => b.replies - a.replies).slice(0, 5);
    const sortedByLikes = [...allTweets].sort((a, b) => b.likes - a.likes).slice(0, 5);
    
    return {
        top_retweets: sortedByRetweets,
        top_replies: sortedByReplies,
        top_likes: sortedByLikes
    };
}

// Escape HTML special characters
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Unescape HTML special characters
function unescapeHtml(text) {
    const map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) { return map[m]; });
}