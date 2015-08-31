/*
 * Module for managing ajax forms with Django forms.
 * Features:
 *   - loading form data serialized Django object
 *   - saving form data to Django forms
 *   - showing errors from Django forms
 */

kAjaxForm = function(form, controller_url) {
    this.params = {
        reload_after_save: false
    };
    this.form = form;
    this.controller_url = controller_url;
    this.displayElements = function(state) {
        if(state == 1)
        {
            $(".kform-errors").html(""); 
            $(".kform-wait").show();
            $(".kform-submit").hide();
        }
        else 
        {
            $(".kform-wait").hide();
            $(".kform-submit").show();
        }
    };
    this.getFormData = function() {
        return this.form.serializeArray();
    };

    this.setFieldErrorInfo = function($ffield, v) {
        var msg = '<label class="kform-field-error">' + v[0] + '</label>';
        $ffield.parent().append(msg);
    };

    this.showErrors = function(errorsJson) {
        var that = this;
        $.each(errorsJson, function(n, v) {
                var $ffield = $("[name='"+n+"']");
                var errorinfo = that.setFieldErrorInfo($ffield, v);
        });
    };

    this.hideErrors = function() {
        $(".kform-field-error").remove();
    };

    this.runClose = function() {
            $(".kform-hide-on-success").show();
            $(".kform-show-on-success").hide();
            $(".kform-show-on-success").hide();
            $(".kform-field-error").remove();
    };

    this.clickClose = function() {
        var that = this;
        $(".close").click(function() {
                that.runClose();
        });
    };

    this.runSuccess = function() {
        $(".kform-hide-on-success").hide();
        $(".kform-show-on-success").show();
    };


    this.onSubmit = function(){
        var that = this;
        this.form.submit(function(event){
            event.preventDefault();
            that.displayElements(1);
            formData = that.getFormData();
            that.hideErrors();

            $.ajax({
                url : that.controller_url,
                method: 'POST',
                data : formData,
                dataType: 'json' 
            }).done(function(ret) {
                if(ret.status && ret.data.status) {
                    that.displayElements(0);
                    that.runSuccess();

                    $('body').trigger('visit:changed');

                    if(that.params.reload_after_save) {
                        location.reload();
                    }
                }
                else {
                    that.displayElements(0);
                    if(ret.data.errors) {
                        that.showErrors(ret.data.errors);
                    }
                }
            }).error(function(ret) {
                that.displayElements(0);
                $(".kform-errors").html("Problem with submitting the form occured."); 
            });
        });

    return false;

    };

    this.loadData = function(parameters) {
        var that = this;
        that.displayElements(1);

        $.ajax({
            url : that.controller_url, 
            method: 'GET',
            data : parameters,
            dataType: 'json' 
        }).done(function(ret) {
            if(ret.status && ret.data.status) {
                var obj = JSON.parse(ret.data.object)[0];
                $.each(obj.fields, function(n, v) {
                    that.form.find('[name="'+n+'"]').val(v);
                });
                that.form.find('[name="id"]').val(obj.pk);

            }
            else {
                that.displayElements(0);
                if(ret.data.errors) {
                    that.showErrors(ret.data.errors);
                }
            }
        }).error(function(ret) {
            that.displayElements(0);
            $(".kform-errors").html("Problem with submitting the form occured."); 
        });
    return false;

    };

    this.init = function(params){
        var that = this;
        if(typeof params !== undefined) {
            $.each(params, function(n, v) {
                that.params[n] = v;
            });
        }
        this.clickClose();
        this.onSubmit();
    };
}
