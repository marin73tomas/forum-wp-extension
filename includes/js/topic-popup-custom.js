jQuery(document).ready(function ($) {
  $(document.body).on("click", "#fmwp-topic-popup-preview-action", function () {
    var editors = $(this).parents("#fmwp-topic-popup-editors");
    if (editors.hasClass("fmwp-topic-popup-preview-hidden")) {
      editors.removeClass("fmwp-topic-popup-preview-hidden");
      $(this).html($(this).data("hide_label"));

      $("#fmwptopiccontent-preview").html($("#fmwptopiccontent").val());
    } else {
      editors.addClass("fmwp-topic-popup-preview-hidden");
      $(this).html($(this).data("show_label"));
    }
    fmwp_resize_popup();
  });

  $(document.body).on("click", ".fmwp-topic-popup-discard", function () {
    if (fmwp_is_busy("topic_popup")) {
      return;
    }

    var popup = $(this).parents("#fmwp-topic-popup-wrapper");
    popup.hide(1, function () {
      var form = popup.find("form");
      form[0].reset();

      $("#fmwptopiccontent").val("");
      $("#fmwptopiccontent-preview").html("");
      popup.removeClass("fmwp-fullsize");

      var editors_button = popup.find("#fmwp-topic-popup-preview-action");
      editors_button.html(editors_button.data("hide_label"));
      popup
        .find("#fmwp-topic-popup-editors")
        .removeClass("fmwp-topic-popup-preview-hidden");
    });
  });

  $(document.body).on("click", ".fmwp-topic-popup-submit", function (e) {
    e.preventDefault();

    if (fmwp_is_busy("topic_popup")) {
      return;
    }

    var obj = $(this);

    obj.siblings(".fmwp-ajax-loading").css("visibility", "visible").show();
    obj.css("visibility", "hidden");

    var popup = $("#fmwp-topic-popup-wrapper");
    var form = $(this).parents("form");
    var serialize_data = form.serializeArray();

    var data = {};
    $.each(serialize_data, function (i) {
      data[serialize_data[i].name] = serialize_data[i].value;
    });

    var forum_id = data["fmwp-topic[forum_id]"];
    var topic_id = data["fmwp-topic[topic_id]"];

    var ajax_action =
      data["fmwp-action"] === "edit-topic"
        ? "fmwp_edit_topic"
        : "fmwp_create_topic";

    form
      .find("input, #wp-fmwptopiccontent-wrap")
      .removeClass("fmwp-error-field")
      .removeAttr("title");

    var formData = new FormData(form[0]);
    formData.append("action", ajax_action);
    fmwp_set_busy("topic_popup", true);
    $.ajax({
      url: ajaxvars.ajaxurl,
      type: "POST",
      data: formData,
      async: true,
      cache: false,
      contentType: false,
      enctype: "multipart/form-data",
      processData: false,
      success: function (data) {
        if (!data.success) {
          if (data.data?.errors) {
            $.each(data.data.errors, function (i) {
              jQuery("#" + data.data.errors[i].field)
                .addClass("fmwp-error-field")
                .attr("title", data.data.errors[i].message);
            });
          } else {
            $(this).fmwp_notice({
              message: data.data,
              type: "error",
            });
          }
          fmwp_set_busy("topic_popup", false);

          obj.siblings(".fmwp-ajax-loading").css("visibility", "hidden");
          obj.css("visibility", "visible");
          return;
        }
        if (data.data) data = data.data;
        if (ajax_action === "fmwp_edit_topic") {
          var target = popup.data("fmwp-target");

          fmwp_edit_topic_cb(data, forum_id, topic_id, target);
        } else {
          fmwp_create_topic_cb(data, forum_id);
        }

        obj.siblings(".fmwp-ajax-loading").css("visibility", "hidden");
        obj.css("visibility", "visible");
      },
    });
  });

  function fmwp_create_topic_cb(data, forum_id) {
    console.log;
    var post_template = wp.template("fmwp-topic");
    var layout = post_template(data);

    var wrapper = $(
      '.fmwp-topics-wrapper[data-fmwp_forum_id="' + forum_id + '"]'
    );
    if (!wrapper.length) {
      wrapper = $(".fmwp-archive-topics-wrapper .fmwp-topics-wrapper");
    }
    var order = wrapper.data("order");
    if (order === "date_desc") {
      if (wrapper.find(".fmwp-topic-row.fmwp-topic-announcement:last").length) {
        wrapper
          .find(".fmwp-topic-row.fmwp-topic-announcement:last")
          .after(layout);
      } else if (
        wrapper.find(".fmwp-topic-row.fmwp-topic-pinned:last").length
      ) {
        wrapper.find(".fmwp-topic-row.fmwp-topic-pinned:last").after(layout);
      } else if (
        wrapper.find(".fmwp-topic-row.fmwp-topic-global:last").length
      ) {
        wrapper.find(".fmwp-topic-row.fmwp-topic-global:last").after(layout);
      } else {
        wrapper.prepend(layout);
      }
    } else if (order === "date_asc") {
      wrapper.append(layout);
    }

    if (wrapper.find(".fmwp-forum-no-topics").length) {
      wrapper.find(".fmwp-forum-no-topics").remove();
    }

    if (wrapper.find(".fmwp-topic-actions-dropdown").length) {
      wrapper
        .siblings(".fmwp-topics-wrapper-heading")
        .removeClass("fmwp-no-actions-heading");
    } else {
      wrapper
        .siblings(".fmwp-topics-wrapper-heading")
        .addClass("fmwp-no-actions-heading");
    }

    fmwp_set_busy("topic_popup", false);

    //close popup
    $(".fmwp-topic-popup-discard:first").trigger("click");
  }

  function fmwp_edit_topic_cb(data, forum_id, topic_id, target) {
    if (target === "forum-page" || target === "topics-page") {
      var post_template = wp.template("fmwp-topic");
      var layout = post_template(data);

      $(".fmwp-topics-wrapper")
        .find('.fmwp-topic-row[data-topic_id="' + topic_id + '"]')
        .replaceWith(layout);
    } else if (target === "topic-page") {
      $(".fmwp-topic-title").html(data.title);
      $(".fmwp-topic-data-content").html(data.content);

      if ($(".fmwp-topic-stats.fmwp-tags-stats").length) {
        var tags_line = wp.template("fmwp-topic-tags-line");
        var tags_line_content = tags_line(data.tags);
        $(".fmwp-topic-stats.fmwp-tags-stats").html(tags_line_content);
      }

      wp.hooks.doAction("fmwp_after_edit_topic", data);
    }

    fmwp_set_busy("topic_popup", false);

    //close popup
    $(".fmwp-topic-popup-discard:first").trigger("click");
  }

  function fmwp_build_preview(callback, ms) {
    var timer = 0;
    return function () {
      var context = this,
        args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        callback.apply(context, args);
      }, ms || 0);
    };
  }

  $(document.body).on(
    "keyup",
    "#fmwptopiccontent",
    fmwp_build_preview(function (e) {
      var editors = $(this).parents("#fmwp-topic-popup-editors");
      if (!editors.hasClass("fmwp-topic-popup-preview-hidden")) {
        if (fmwp_is_busy("topic_popup_preview")) {
          return;
        }

        // reduce AJAX queries for getting preview
        var hash = fmwp_stringToHash(this.value);
        var data_hash = $(this).data("content-hash");
        if (hash == data_hash) {
          return;
        }

        $(this).data("content-hash", hash);

        fmwp_set_busy("topic_popup_preview", true);
        wp.ajax.send("fmwp_topic_build_preview", {
          data: {
            content: this.value,
            nonce: fmwp_front_data.nonce,
          },
          success: function (data) {
            $("#fmwptopiccontent-preview").html(data);
            fmwp_set_busy("topic_popup_preview", false);
          },
          error: function (data) {
            console.log(data);
            $(this).fmwp_notice({
              message: data,
              type: "error",
            });
            fmwp_set_busy("topic_popup_preview", false);
          },
        });
      }
    }, 1000)
  );
});
