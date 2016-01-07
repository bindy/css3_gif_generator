(function() {

    var aniMap = new hashMap();

    $('#ID_btn_theme').parent().on('dragover', function(e) {
        $(this).addClass('highlight')
    });
    $('#ID_btn_theme').parent().on('dragleave', function() {
        $(this).removeClass('highlight')
    });
    $('#ID_btn_theme').parent().on('dragend', function(e) {
        $(this).removeClass('highlight')
    });
    $('#ID_btn_theme').parent().on('drop', function(e) {
        $(this).removeClass('highlight')
    });
    $('#ID_btn_theme').on('change', function(e) {


        $('.overlay').addClass('active');
        $.when(_getImgData()).then(function() {
            setTimeout(function() {
                _createSprite();
            }, 100)
        })

        function _getImgData() {
            var dfd = new $.Deferred();
            var files = e.target.files;
            var imgWidth, imgHeight;

            for (var i = 0, len = files.length; i < len; i++) {
                var file = files[i];
                var reader = new FileReader();
                if (file.type === 'image/png' || file.type === 'image/jpeg') {

                    reader.readAsDataURL(file);
                }

                reader.onload = (function(file, i) {
                    return function(e) {

                        var fname = file.name;
                        var findex = fname.replace('.png', '');

                        aniMap.set(findex, e.target.result);
                        aniMap.set('fileNum', len);

                        if (aniMap.fileWidth == undefined && aniMap.fileHeight == undefined) {

                            var imgLoader = new Image();
                            imgLoader.onload = function() {
                                imgWidth = imgLoader.width;
                                imgHeight = imgLoader.height;
                                aniMap.set('fileWidth', imgWidth);
                                aniMap.set('fileHeight', imgHeight);
                            }

                            imgLoader.src = aniMap.obj[1];
                        }

                        if (i == len - 1) {
                            dfd.resolve("hurray");
                        }
                    };
                })(file, i);

            }

            return dfd.promise();

        }

        function _createSprite() {

            $('.result-wrap').show();

            var canvas_v = document.createElement('canvas');


            canvas_v.width = aniMap.obj.fileWidth;
            canvas_v.height = aniMap.obj.fileHeight * aniMap.obj.fileNum;

            var ctx_v = canvas_v.getContext('2d');
            __create(aniMap, 1);

            $('.down').on('click', function() {
                download();
                return false;
            })


            function __create(data, index) {

                var img = new Image();
                var length = data.obj.fileNum;

                img.onload = function(args, imgdata, all) {
                    //闭包解决传参问题

                    return function() {
                        var imgWidth = data.obj.fileWidth;
                        var imgHeight = data.obj.fileHeight;

                        ctx_v.drawImage(imgdata, 0, (args - 1) * imgHeight, imgWidth, imgHeight)

                        if (args < all) {
                            __create(aniMap, index + 1)
                        }

                        if (args == all) {

                            var aniSpriteV = canvas_v.toDataURL("image/png");

                            $.ajax('server/compress.php', {
                                type: "POST",
                                dataType: 'json',
                                data: JSON.stringify({
                                    pic: aniSpriteV,
                                    percentage: 60
                                }),
                                success: function(data) {
                                    if (data) {



                                        var data_array = data.split('|');
                                        var percentage = (parseInt(data_array[0]) - parseInt(data_array[1])) / parseInt(data_array[0]) * 100;

                                        $('.hidden-img').html(data_array[4]);

                                        var umcompressSize = bytesToSize(data_array[0]);
                                        var compressSize = bytesToSize(data_array[1]);

                                        $('.opt-before').html(umcompressSize);
                                        $('.opt-after').html(compressSize);


                                        $('.result-wrap').find('span').attr('href', 'server/' + data_array[2]);

                                        $('.overlay').removeClass('active');

                                        $('.result-wrap').show();

                                        $('.time-wrap,.preview-wrap,.comp-wrap').show();



                                        var stylesheet = createStyle();

                                        var styleText = '@-webkit-keyframes ani' + imgHeight + '{0%{background-position: 0 0;}100%{background-position:0 -' + imgHeight * all + 'px;}}';
                                        // $('.result-imgh').attr('src', aniSpriteH);
                                        // $('.result-imgv').attr('src', aniSpriteV);

                                        setTimeout(function() {
                                            stylesheet.innerHTML = styleText;

                                            $('.preview-img-after')[0].style.cssText += 'width:' + imgWidth + 'px;' +
                                                'height:' + imgHeight + 'px;' +
                                                'background-image: url(server/' + data_array[2].replace(/\\/g, '/') + ');' +
                                                '-webkit-animation: ani' + imgHeight + ' ' + all * 100 + 'ms steps(' + all + ',end)  infinite';

                                            $('.preview-img-before')[0].style.cssText += 'width:' + imgWidth + 'px;' +
                                                'height:' + imgHeight + 'px;' +
                                                'background-image: url(server/' + data_array[3].replace(/\\/g, '/') + ');' +
                                                '-webkit-animation: ani' + imgHeight + ' ' + all * 100 + 'ms steps(' + all + ',end)  infinite';

                                            $('.cur_val').find('span').html(all /10 +"s");
                                            $('.time_input').val(all * 100);

                                        }, 0)
                                    }

                                },
                                error: function(xhr) {
                                    console.log(xhr.responseText);
                                }
                            })


                        }
                    }
                }(index, img, length)

                img.src = data.obj[index];

            }
        }


    })

    $('#formController').on('change', function(e) {
        var timeCur;

        if (e.target.name == 'time_input') {
            timeCur = e.target.value;

            $('.cur_val').find('span').html(timeCur/1000 + "s");
            $('.preview-img-before').css('-webkit-animation-duration', timeCur + 'ms').hide();
            setTimeout(function() {
                $('.preview-img-before').show();
            }, 500)
            $('.preview-img-after').css('-webkit-animation-duration', timeCur + 'ms').hide();
            setTimeout(function() {
                $('.preview-img-after').show();
            }, 500)
        }
    })

    $('#compController').on('change', function(e) {

        if (e.target.name == 'comp_input') {
            var compCur = e.target.value;
            var timeCur = $('.time_input').val();
            var pic = $('.hidden-img').html();

            $('.cur_comp').find('span').html(compCur);

            $('.overlay').addClass('active');

            $.ajax('server/compress.php', {
                type: "POST",
                dataType: 'json',
                data: JSON.stringify({
                    id: pic,
                    percentage: compCur
                }),
                success: function(data) {
                    if (data) {

                        var data_array = data.split('|');
                        var percentage = (parseInt(data_array[0]) - parseInt(data_array[1])) / parseInt(data_array[0]) * 100;

                        var umcompressSize = bytesToSize(data_array[0]);
                        var compressSize = bytesToSize(data_array[1]);

                        $('.opt-before').html(umcompressSize);
                        $('.opt-after').html(compressSize);

                        $('.result-wrap').find('span').attr('href', 'server/' + data_array[2]);

                        $('.overlay').removeClass('active');

                        setTimeout(function() {

                            $('.preview-img-after').css('background-image', 'url(server/' + data_array[2] + ')');
                        }, 0)
                    }

                },
                error: function(xhr) {
                    console.log(xhr.responseText);
                }
            })

        }


    })

    $('#ID_time_control').on('input', function() {

        $('.preview-img-before').css('-webkit-animation-duration', $(this).val() + 'ms').hide();
        setTimeout(function() {
            $('.preview-img-before').show();
        }, 500)

        $('.preview-img-after').css('-webkit-animation-duration', $(this).val() + 'ms').hide();
        setTimeout(function() {
            $('.preview-img-after').show();
        }, 500)

    })



    var loader = new Spinner({
        top: 10,
        width: 5,
        length: 15,
        radius: 10,
        color: '#fff'
    });

    loader.spin(document.getElementById('ID_loader'));

    function bytesToSize(bytes) {
        if (bytes == 0) return '0 Byte';
        var k = 1024;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }


    function hashMap() {

        this.obj = {};

        hashMap.prototype.set = function(key, value) {
            this.obj[key] = value
        };
        hashMap.prototype.get = function(key) {
            return this.obj[key]
        };
        hashMap.prototype.contains = function(key) {
            return this.obj.get(key) == null ? false : true
        };
        hashMap.prototype.remove = function(key) {
            delete this.obj[key]
        }

    }

    function createStyle() {
        var stylesheet = document.createElement("style");
        stylesheet.className = 'animation';
        $('head').append(stylesheet);
        return stylesheet;
    }


    function download() {
        var zip = new JSZip();
        var timeCur = $('.time_input').val();
        zip.file("others.txt", "时间参数 " + timeCur + "s");

        var xhr = new XMLHttpRequest();
        var url = $('.down').attr('href');
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) {
            if (this.status == 200) {
                var uInt8Array = new Uint8Array(this.response);
                var i = uInt8Array.length;
                var binaryString = new Array(i);
                while (i--) {
                    binaryString[i] = String.fromCharCode(uInt8Array[i]);
                }
                var data = binaryString.join('');
                var base64 = window.btoa(data);

                zip.file('data.png', base64, {
                    base64: true
                });
                var content = zip.generate({
                    type: "blob"
                });
                saveAs(content, "data.zip");
            }
        }
        xhr.send();
        return false;


    }

})()