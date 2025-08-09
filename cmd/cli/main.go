package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	http "github.com/bogdanfinn/fhttp"
	"github.com/bogdanfinn/fhttp/http2"
	tls_client "github.com/bogdanfinn/tls-client"
	"github.com/bogdanfinn/tls-client/profiles"
	tls "github.com/bogdanfinn/utls"
)

// 请求配置结构体
type RequestConfig struct {
	URL             string            `json:"url"`
	Method          string            `json:"method"`
	Headers         map[string]string `json:"headers,omitempty"`
	Body            string            `json:"body,omitempty"`
	Timeout         int               `json:"timeout,omitempty"`
	Profile         string            `json:"profile,omitempty"`
	Proxy           string            `json:"proxy,omitempty"`
	FollowRedirects bool              `json:"followRedirects"`
	InsecureSkipTLS bool              `json:"insecureSkipTLS,omitempty"`
	CustomTls       *CustomTlsConfig  `json:"customTls,omitempty"`
}

// 自定义TLS配置结构体
type CustomTlsConfig struct {
	JA3String                               string                 `json:"ja3String"`
	H2Settings                              map[string]uint32      `json:"h2Settings,omitempty"`
	H2SettingsOrder                         []string               `json:"h2SettingsOrder,omitempty"`
	SupportedSignatureAlgorithms            []string               `json:"supportedSignatureAlgorithms,omitempty"`
	SupportedDelegatedCredentialsAlgorithms []string               `json:"supportedDelegatedCredentialsAlgorithms,omitempty"`
	SupportedVersions                       []string               `json:"supportedVersions,omitempty"`
	KeyShareCurves                          []string               `json:"keyShareCurves,omitempty"`
	CertCompressionAlgos                    []string               `json:"certCompressionAlgos,omitempty"`
	ALPNProtocols                           []string               `json:"alpnProtocols,omitempty"`
	ALPSProtocols                           []string               `json:"alpsProtocols,omitempty"`
	PseudoHeaderOrder                       []string               `json:"pseudoHeaderOrder,omitempty"`
	ConnectionFlow                          uint32                 `json:"connectionFlow,omitempty"`
	ECHCandidatePayloads                    []uint16               `json:"echCandidatePayloads,omitempty"`
	ECHCandidateCipherSuites                []CandidateCipherSuite `json:"echCandidateCipherSuites,omitempty"`
	RecordSizeLimit                         uint16                 `json:"recordSizeLimit,omitempty"`
}

// 候选密码套件
type CandidateCipherSuite struct {
	KdfId  string `json:"kdfId"`
	AeadId string `json:"aeadId"`
}

// 响应结构体
type Response struct {
	StatusCode   int               `json:"statusCode"`
	Headers      map[string]string `json:"headers"`
	Body         string            `json:"body"`
	Cookies      []Cookie          `json:"cookies"`
	Error        string            `json:"error,omitempty"`
	RequestTime  int64             `json:"requestTime"` // 请求耗时（毫秒）
	ContentType  string            `json:"contentType"`
	Size         int               `json:"size"`
}

// Cookie结构体
type Cookie struct {
	Name     string `json:"name"`
	Value    string `json:"value"`
	Domain   string `json:"domain"`
	Path     string `json:"path"`
	Expires  string `json:"expires,omitempty"`
	HttpOnly bool   `json:"httpOnly"`
	Secure   bool   `json:"secure"`
}

// 支持的浏览器配置文件
var supportedProfiles = map[string]profiles.ClientProfile{
	// Chrome 配置文件
	"chrome_103":     profiles.Chrome_103,
	"chrome_104":     profiles.Chrome_104,
	"chrome_105":     profiles.Chrome_105,
	"chrome_106":     profiles.Chrome_106,
	"chrome_107":     profiles.Chrome_107,
	"chrome_108":     profiles.Chrome_108,
	"chrome_109":     profiles.Chrome_109,
	"chrome_110":     profiles.Chrome_110,
	"chrome_111":     profiles.Chrome_111,
	"chrome_112":     profiles.Chrome_112,
	"chrome_116":     profiles.Chrome_117, // 注意：116版本使用117配置
	"chrome_117":     profiles.Chrome_117,
	"chrome_118":     profiles.Chrome_117, // 注意：118版本使用117配置
	"chrome_119":     profiles.Chrome_117, // 注意：119版本使用117配置
	"chrome_120":     profiles.Chrome_120,
	"chrome_124":     profiles.Chrome_124,
	"chrome_131":     profiles.Chrome_131,
	"chrome_133":     profiles.Chrome_133,
	
	// Firefox 配置文件
	"firefox_102":    profiles.Firefox_102,
	"firefox_104":    profiles.Firefox_104,
	"firefox_105":    profiles.Firefox_105,
	"firefox_106":    profiles.Firefox_106,
	"firefox_108":    profiles.Firefox_108,
	"firefox_110":    profiles.Firefox_110,
	"firefox_117":    profiles.Firefox_117,
	"firefox_118":    profiles.Firefox_117, // 注意：118版本使用117配置
	"firefox_119":    profiles.Firefox_117, // 注意：119版本使用117配置
	"firefox_120":    profiles.Firefox_120,
	"firefox_123":    profiles.Firefox_123,
	"firefox_132":    profiles.Firefox_132,
	"firefox_133":    profiles.Firefox_133,
	"firefox_135":    profiles.Firefox_135,
	
	// Safari 配置文件
	"safari_15_6_1":  profiles.Safari_15_6_1,
	"safari_16_0":    profiles.Safari_16_0,
	"safari_16_5":    profiles.Safari_16_0, // 注意：16.5版本使用16.0配置
	"safari_17_0":    profiles.Safari_IOS_17_0, // 使用iOS 17.0配置
	"safari_ios_15_5": profiles.Safari_IOS_15_5,
	"safari_ios_15_6": profiles.Safari_IOS_15_6,
	"safari_ios_16_0": profiles.Safari_IOS_16_0,
	"safari_ios_17_0": profiles.Safari_IOS_17_0,
	"safari_ios_18_0": profiles.Safari_IOS_18_0,
	"safari_ios_18_5": profiles.Safari_IOS_18_5,
	"safari_ipad_15_6": profiles.Safari_Ipad_15_6,
	
	// Opera 配置文件
	"opera_89":       profiles.Opera_89,
	"opera_90":       profiles.Opera_90,
	"opera_91":       profiles.Opera_91,
	
	// 移动端应用配置文件
	"zalando_android_mobile": profiles.ZalandoAndroidMobile,
	"zalando_ios_mobile":     profiles.ZalandoIosMobile,
	"nike_ios_mobile":        profiles.NikeIosMobile,
	"nike_android_mobile":    profiles.NikeAndroidMobile,
	
	// 其他配置文件
	"cloudscraper":      profiles.CloudflareCustom,
	"mms_ios":           profiles.MMSIos,
	"mms_ios_1":         profiles.MMSIos,
	"mms_ios_2":         profiles.MMSIos2,
	"mms_ios_3":         profiles.MMSIos3,
	"mesh_ios":          profiles.MeshIos,
	"mesh_ios_1":        profiles.MeshIos,
	"mesh_ios_2":        profiles.MeshIos2,
	"mesh_android":      profiles.MeshAndroid,
	"mesh_android_1":    profiles.MeshAndroid,
	"mesh_android_2":    profiles.MeshAndroid2,
	"confirmed_ios":     profiles.ConfirmedIos,
	"confirmed_android": profiles.ConfirmedAndroid,
	
	// OkHttp Android 配置文件
	"okhttp4_android_7":  profiles.Okhttp4Android7,
	"okhttp4_android_8":  profiles.Okhttp4Android8,
	"okhttp4_android_9":  profiles.Okhttp4Android9,
	"okhttp4_android_10": profiles.Okhttp4Android10,
	"okhttp4_android_11": profiles.Okhttp4Android11,
	"okhttp4_android_12": profiles.Okhttp4Android12,
	"okhttp4_android_13": profiles.Okhttp4Android13,
	
	// 向前兼容的Edge配置（使用Chrome配置）
	"edge_107":       profiles.Chrome_107,
	"edge_99":        profiles.Chrome_107,
}

func main() {
	// 命令行参数定义
	var (
		url             = flag.String("url", "", "请求URL（必须）")
		method          = flag.String("method", "GET", "HTTP方法 (GET, POST, PUT, DELETE等)")
		headers         = flag.String("headers", "", "请求头，JSON格式")
		body            = flag.String("body", "", "请求体内容")
		timeout         = flag.Int("timeout", 30, "超时时间（秒）")
		profile         = flag.String("profile", "chrome_120", "浏览器配置文件")
		proxy           = flag.String("proxy", "", "代理地址 (如: http://user:pass@host:port)")
		followRedirects = flag.Bool("follow-redirects", true, "是否跟随重定向")
		insecureSkipTLS = flag.Bool("insecure", false, "跳过TLS证书验证")
		configFile      = flag.String("config", "", "JSON配置文件路径")
		listProfiles    = flag.Bool("list-profiles", false, "列出支持的浏览器配置文件")
		version         = flag.Bool("version", false, "显示版本信息")
		help            = flag.Bool("help", false, "显示帮助信息")
		
		// JA3指纹自定义参数
		ja3String       = flag.String("ja3", "", "自定义JA3指纹字符串")
		customTlsConfig = flag.String("custom-tls", "", "自定义TLS配置，JSON格式")
	)

	flag.Parse()

	// 显示版本信息
	if *version {
		fmt.Println("TLS-Client CLI v1.11.0")
		fmt.Println("基于 github.com/bogdanfinn/tls-client")
		return
	}

	// 显示帮助信息
	if *help {
		printHelp()
		return
	}

	// 列出支持的配置文件
	if *listProfiles {
		listSupportedProfiles()
		return
	}

	var config RequestConfig

	// 如果指定了配置文件，从文件读取配置
	if *configFile != "" {
		if err := loadConfigFromFile(*configFile, &config); err != nil {
			outputError(fmt.Sprintf("读取配置文件失败: %v", err))
			return
		}
	} else {
		// 从命令行参数构建配置
		config = RequestConfig{
			URL:             *url,
			Method:          strings.ToUpper(*method),
			Timeout:         *timeout,
			Profile:         *profile,
			Proxy:           *proxy,
			FollowRedirects: *followRedirects,
			InsecureSkipTLS: *insecureSkipTLS,
			Body:            *body,
		}

		// 解析请求头
		if *headers != "" {
			if err := json.Unmarshal([]byte(*headers), &config.Headers); err != nil {
				outputError(fmt.Sprintf("解析请求头失败: %v", err))
				return
			}
		}

		// 处理JA3指纹
		if *ja3String != "" {
			config.CustomTls = &CustomTlsConfig{
				JA3String: *ja3String,
				// 默认配置
				SupportedSignatureAlgorithms: []string{
					"ECDSAWithP256AndSHA256",
					"PSSWithSHA256",
					"PKCS1WithSHA256",
					"ECDSAWithP384AndSHA384",
					"PSSWithSHA384",
					"PKCS1WithSHA384",
					"PSSWithSHA512",
					"PKCS1WithSHA512",
				},
				SupportedVersions: []string{"GREASE", "1.3", "1.2"},
				KeyShareCurves:    []string{"GREASE", "X25519"},
				CertCompressionAlgos: []string{"brotli", "zlib"},
				ALPNProtocols:     []string{"h2", "http/1.1"},
				ALPSProtocols:     []string{"h2"},
				PseudoHeaderOrder: []string{":method", ":authority", ":scheme", ":path"},
				ConnectionFlow:    15663105,
			}
		}

		// 处理自定义TLS配置
		if *customTlsConfig != "" {
			var customTls CustomTlsConfig
			if err := json.Unmarshal([]byte(*customTlsConfig), &customTls); err != nil {
				outputError(fmt.Sprintf("解析自定义TLS配置失败: %v", err))
				return
			}
			config.CustomTls = &customTls
		}
	}

	// 验证必需参数
	if config.URL == "" {
		outputError("URL参数不能为空")
		return
	}

	// 执行请求
	response := executeRequest(config)
	outputResponse(response)
}

// 执行HTTP请求
func executeRequest(config RequestConfig) Response {
	startTime := time.Now()
	
	// 创建响应对象
	response := Response{
		Headers: make(map[string]string),
		Cookies: []Cookie{},
	}

	// 确定客户端配置文件
	var clientProfile profiles.ClientProfile
	var useCustomProfile bool
	
	if config.CustomTls != nil {
		// 使用自定义JA3配置
		useCustomProfile = true
	} else {
		// 使用预定义的浏览器配置文件
		var exists bool
		clientProfile, exists = supportedProfiles[config.Profile]
		if !exists {
			response.Error = fmt.Sprintf("不支持的浏览器配置文件: %s", config.Profile)
			return response
		}
	}

	// 设置默认值
	if config.Timeout == 0 {
		config.Timeout = 30
	}

	// 创建TLS客户端选项
	var options []tls_client.HttpClientOption
	
	if useCustomProfile {
		// 使用自定义JA3配置创建客户端
		customTls := config.CustomTls
		
		// 转换CandidateCipherSuite为库所需格式
		var echCandidateCipherSuites []tls_client.CandidateCipherSuites
		for _, cs := range customTls.ECHCandidateCipherSuites {
			echCandidateCipherSuites = append(echCandidateCipherSuites, tls_client.CandidateCipherSuites{
				KdfId:  cs.KdfId,
				AeadId: cs.AeadId,
			})
		}
		
		// 创建自定义配置文件
		specFactory, err := tls_client.GetSpecFactoryFromJa3String(
			customTls.JA3String,
			customTls.SupportedSignatureAlgorithms,
			customTls.SupportedDelegatedCredentialsAlgorithms,
			customTls.SupportedVersions,
			customTls.KeyShareCurves,
			customTls.ALPNProtocols,
			customTls.ALPSProtocols,
			echCandidateCipherSuites,
			customTls.ECHCandidatePayloads,
			customTls.CertCompressionAlgos,
			customTls.RecordSizeLimit,
		)
		if err != nil {
			response.Error = fmt.Sprintf("创建自定义TLS配置失败: %v", err)
			return response
		}
		
		// 转换H2Settings
		h2Settings := make(map[string]uint32)
		if customTls.H2Settings != nil {
			for k, v := range customTls.H2Settings {
				h2Settings[k] = v
			}
		} else {
			// 默认HTTP/2设置
			h2Settings = map[string]uint32{
				"HEADER_TABLE_SIZE":      65536,
				"MAX_CONCURRENT_STREAMS": 1000,
				"INITIAL_WINDOW_SIZE":    6291456,
				"MAX_HEADER_LIST_SIZE":   262144,
			}
		}
		
		h2SettingsOrder := customTls.H2SettingsOrder
		if len(h2SettingsOrder) == 0 {
			h2SettingsOrder = []string{
				"HEADER_TABLE_SIZE",
				"MAX_CONCURRENT_STREAMS", 
				"INITIAL_WINDOW_SIZE",
				"MAX_HEADER_LIST_SIZE",
			}
		}
		
		pseudoHeaderOrder := customTls.PseudoHeaderOrder
		if len(pseudoHeaderOrder) == 0 {
			pseudoHeaderOrder = []string{":method", ":authority", ":scheme", ":path"}
		}
		
		connectionFlow := customTls.ConnectionFlow
		if connectionFlow == 0 {
			connectionFlow = 15663105
		}
		
		// 创建ClientHelloID  
		clientHelloId := tls.ClientHelloID{
			Client:      "CustomJA3",
			Version:     "1",
			Seed:        nil,
			SpecFactory: specFactory,
		}
		
		// 转换HTTP/2设置格式
		h2SettingsConverted := make(map[http2.SettingID]uint32)
		h2SettingsOrderConverted := make([]http2.SettingID, 0)
		
		// 设置映射
		settingsMap := map[string]http2.SettingID{
			"HEADER_TABLE_SIZE":      http2.SettingHeaderTableSize,
			"ENABLE_PUSH":            http2.SettingEnablePush,
			"MAX_CONCURRENT_STREAMS": http2.SettingMaxConcurrentStreams,
			"INITIAL_WINDOW_SIZE":    http2.SettingInitialWindowSize,
			"MAX_FRAME_SIZE":         http2.SettingMaxFrameSize,
			"MAX_HEADER_LIST_SIZE":   http2.SettingMaxHeaderListSize,
		}
		
		for k, v := range h2Settings {
			if settingID, ok := settingsMap[k]; ok {
				h2SettingsConverted[settingID] = v
			}
		}
		
		for _, order := range h2SettingsOrder {
			if settingID, ok := settingsMap[order]; ok {
				h2SettingsOrderConverted = append(h2SettingsOrderConverted, settingID)
			}
		}
		
		// 创建自定义客户端配置文件
		customClientProfile := profiles.NewClientProfile(
			clientHelloId,
			h2SettingsConverted,
			h2SettingsOrderConverted,
			pseudoHeaderOrder,
			connectionFlow,
			nil, // priorities
			nil, // headerPriority
		)
		
		options = []tls_client.HttpClientOption{
			tls_client.WithTimeoutSeconds(config.Timeout),
			tls_client.WithClientProfile(customClientProfile),
		}
	} else {
		// 使用预定义配置文件
		options = []tls_client.HttpClientOption{
			tls_client.WithTimeoutSeconds(config.Timeout),
			tls_client.WithClientProfile(clientProfile),
			tls_client.WithRandomTLSExtensionOrder(),
		}
	}

	// 配置重定向
	if !config.FollowRedirects {
		options = append(options, tls_client.WithNotFollowRedirects())
	}

	// 配置跳过TLS验证
	if config.InsecureSkipTLS {
		options = append(options, tls_client.WithInsecureSkipVerify())
	}

	// 配置代理
	if config.Proxy != "" {
		options = append(options, tls_client.WithProxyUrl(config.Proxy))
	}

	// 创建Cookie Jar
	jar := tls_client.NewCookieJar()
	options = append(options, tls_client.WithCookieJar(jar))

	// 创建客户端
	client, err := tls_client.NewHttpClient(tls_client.NewNoopLogger(), options...)
	if err != nil {
		response.Error = fmt.Sprintf("创建客户端失败: %v", err)
		return response
	}

	// 创建请求体
	var bodyReader io.Reader
	if config.Body != "" {
		bodyReader = strings.NewReader(config.Body)
	}

	// 创建HTTP请求
	req, err := http.NewRequest(config.Method, config.URL, bodyReader)
	if err != nil {
		response.Error = fmt.Sprintf("创建请求失败: %v", err)
		return response
	}

	// 设置请求头
	if config.Headers != nil {
		headerOrder := make([]string, 0, len(config.Headers))
		for key, value := range config.Headers {
			req.Header.Set(key, value)
			headerOrder = append(headerOrder, strings.ToLower(key))
		}
		req.Header[http.HeaderOrderKey] = headerOrder
	}

	// 如果是POST/PUT请求且没有设置Content-Type，则设置默认值
	if (config.Method == "POST" || config.Method == "PUT") && req.Header.Get("Content-Type") == "" {
		req.Header.Set("Content-Type", "application/json")
	}

	// 执行请求
	resp, err := client.Do(req)
	if err != nil {
		response.Error = fmt.Sprintf("请求执行失败: %v", err)
		return response
	}
	defer resp.Body.Close()

	// 计算请求耗时
	response.RequestTime = time.Since(startTime).Milliseconds()

	// 读取响应体
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		response.Error = fmt.Sprintf("读取响应体失败: %v", err)
		return response
	}

	// 填充响应信息
	response.StatusCode = resp.StatusCode
	response.Body = string(bodyBytes)
	response.Size = len(bodyBytes)
	response.ContentType = resp.Header.Get("Content-Type")

	// 转换响应头
	for key, values := range resp.Header {
		if len(values) > 0 {
			response.Headers[key] = values[0]
		}
	}

	// 转换Cookies
	for _, cookie := range resp.Cookies() {
		responseCookie := Cookie{
			Name:     cookie.Name,
			Value:    cookie.Value,
			Domain:   cookie.Domain,
			Path:     cookie.Path,
			HttpOnly: cookie.HttpOnly,
			Secure:   cookie.Secure,
		}
		if !cookie.Expires.IsZero() {
			responseCookie.Expires = cookie.Expires.Format(time.RFC3339)
		}
		response.Cookies = append(response.Cookies, responseCookie)
	}

	return response
}

// 从文件加载配置
func loadConfigFromFile(filename string, config *RequestConfig) error {
	data, err := os.ReadFile(filename)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, config)
}

// 输出错误信息
func outputError(message string) {
	response := Response{
		Error: message,
	}
	outputResponse(response)
}

// 输出响应结果
func outputResponse(response Response) {
	jsonData, err := json.Marshal(response)
	if err != nil {
		log.Fatal(fmt.Sprintf("序列化响应失败: %v", err))
	}
	fmt.Println(string(jsonData))
}

// 列出支持的配置文件
func listSupportedProfiles() {
	profiles := make([]string, 0, len(supportedProfiles))
	for profile := range supportedProfiles {
		profiles = append(profiles, profile)
	}
	
	result := map[string][]string{
		"supportedProfiles": profiles,
	}
	
	jsonData, _ := json.Marshal(result)
	fmt.Println(string(jsonData))
}

// 打印帮助信息
func printHelp() {
	helpText := `
TLS-Client CLI - 模拟真实浏览器的HTTP客户端

使用方法:
  tls-client [选项]

选项:
  -url string           请求URL（必需）
  -method string        HTTP方法 (默认: GET)
  -headers string       请求头，JSON格式 (如: '{"User-Agent":"MyApp"}')
  -body string          请求体内容
  -timeout int          超时时间，单位秒 (默认: 30)
  -profile string       浏览器配置文件 (默认: chrome_120)
  -proxy string         代理地址 (如: http://user:pass@host:port)
  -follow-redirects     是否跟随重定向 (默认: true)
  -insecure            跳过TLS证书验证
  -config string        JSON配置文件路径
  -ja3 string          自定义JA3指纹字符串
  -custom-tls string   自定义TLS配置，JSON格式
  -list-profiles       列出支持的浏览器配置文件
  -version             显示版本信息
  -help                显示此帮助信息

示例:
  # 简单GET请求
  tls-client -url "https://httpbin.org/get"
  
  # POST请求带JSON数据
  tls-client -url "https://httpbin.org/post" -method POST -headers '{"Content-Type":"application/json"}' -body '{"key":"value"}'
  
  # 使用Firefox配置文件
  tls-client -url "https://httpbin.org/get" -profile firefox_117
  
  # 使用代理
  tls-client -url "https://httpbin.org/get" -proxy "http://127.0.0.1:8080"
  
  # 使用配置文件
  tls-client -config request.json
  
  # 使用自定义JA3指纹
  tls-client -url "https://httpbin.org/get" -ja3 "771,4865-4866-4867,23-65281-10-11-35-16-5-13-18-51-45-43-27,29-23-24,0"
  
  # 使用完整自定义TLS配置
  tls-client -url "https://httpbin.org/get" -custom-tls '{"ja3String":"771,4865-4866,23-65281,29-23,0","alpnProtocols":["h2","http/1.1"]}'

配置文件格式 (JSON):
{
  "url": "https://httpbin.org/post",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "User-Agent": "MyApp/1.0"
  },
  "body": "{\"key\":\"value\"}",
  "timeout": 30,
  "profile": "chrome_120",
  "followRedirects": true
}

响应格式 (JSON):
{
  "statusCode": 200,
  "headers": {"Content-Type": "application/json"},
  "body": "响应内容",
  "cookies": [{"name": "sessionid", "value": "abc123"}],
  "requestTime": 1500,
  "contentType": "application/json",
  "size": 1024
}
`
	fmt.Print(helpText)
}

