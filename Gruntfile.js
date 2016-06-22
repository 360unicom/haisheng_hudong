/*
http://www.gruntjs.net/configuring-tasks
https://github.com/seajs/seajs/issues/672
https://github.com/jixiangac/lili/tree/master/public/js
http://www.cnblogs.com/hongchenok/p/3924633.html
http://www.jackness.org/2015/01/02/grunt-实例之-构建-seajs-项目/

将命令行的当前目录转到项目的根目录下
安装Grunt 和 grunt插件
npm install grunt --save-dev
npm install grunt-cmd-transport --save-dev
npm install grunt-cmd-concat --save-dev
npm install grunt-contrib-uglify --save-dev
npm install grunt-cmd-clean --save-dev
*/
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        /**
         * step 1:
         * 创建一个临时目录
         * 将需要合并的js文件转为具名函数，并保持独立地保存在这个临时目录
         */
        transport: {
            options: {
                paths: ['.'], //模块的路径，默认的是sea-modules
            },
            activity: {
                options: {
                    idleading: '', //构建后的模块ID的前缀
                },
                files: [{
                    expand: true, //开启处理动态的src-dest文件映射
                    filter: 'isFile', //匹配过滤src文件路径
                    cwd: 'src/', //所有src指定的匹配都将相对于此处指定的路径（但不包括此路径）
                    src: '*.js', //相对于cwd路径的匹配模式
                    dest: '.build/src' //目标文件路径前缀
                }]
            }
        },
        /**
         * step 2:
         * 将临时目录下独立的具名函数文件 合并为 1个 js 文件
         * 将这个合并的 js 文件 拷贝到 我们的输出目录
         */
        concat: {
            options: {
                banner: '/*! <%= pkg.author %>  grunt @  <%= grunt.template.today("yyyy-M-dd HH:mm:ss") %> */\n',// 此处定义的banner注释将插入到输出文件的顶部
                //separator: ';', // 定义一个用于插入合并输出文件之间的字符
                include: 'relative' //relative是合并采用相对路径依赖的模块；all是将所有依赖全都合并成一个文件
            },
            activity: {
                files: {
                    'dist/activity.js': ['.build/src/activity.js'],
                    'dist/activity-debug.js': ['.build/src/activity-debug.js']
                }
            }
        },
        /**
         * step 3:
         * 压缩 这个 合并后的 文件
         */
        uglify: {
            activity: {
                options: {
                    // 此处定义的banner注释将插入到输出文件的顶部
                    banner: '/*! <%= pkg.author %>  grunt @  <%= grunt.template.today("yyyy-M-dd HH:mm:ss") %> */\n'
                },
                files: {
                    'dist/activity.js': ['dist/activity.js'],
                }
            }
        },
        /**
         * step 4:
         * 将这个临时目录删除
         */
        clean: {
            spm: ['.build']
        }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.registerTask('build', ['transport', 'concat', 'uglify', 'clean']);
};